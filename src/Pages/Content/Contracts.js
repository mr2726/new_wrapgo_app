import {View, Text, StyleSheet} from "react-native";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {colors} from "../../styles/theme";
import AsyncStorage from '@react-native-async-storage/async-storage';

// COMPONENTS
import {SegmentedControl_} from "../../components/ui/segmentedControl";
import {TopControl} from "../../components/ui/topControl";
import {ContractItem} from "../../components/ui/ContractItem";
import {ActiveContract} from "../../components/ui/ActiveContract";
import {ServiceVisit} from "../../components/screens/ServiceVisit";
// --------------------------------------------------------------

// Services
import {getCampaignById, getSignedContracts} from "../../components/service/service";
// --------------------------------------------------------------

const STATUS_IN_PROGRESS = 'in progress';
const STATUS_UNDER_REVIEW = 'under review';
const STATUS_ACTIVE = 'active';

const normalizeStatus = (status) => String(status || '').trim().toLowerCase();

export default function Contracts({setLocalPage}) {
    const [selectedTab, setSelectedTab] = useState("active");
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [signedContracts, setSignedContracts] = useState([]);
    const [campaignData, setCampaignData] = useState(null);

    const loadDriverContracts = useCallback(async () => {
        setLoading(true);
        setErrorMessage('');

        try {
            const userDataString = await AsyncStorage.getItem('userData');

            if (!userDataString) {
                setSignedContracts([]);
                return;
            }

            const parsedUserData = JSON.parse(userDataString);

            if (!parsedUserData?.email) {
                setSignedContracts([]);
                return;
            }

            const rows = await getSignedContracts({email: parsedUserData.email});
            setSignedContracts(Array.isArray(rows) ? rows : []);
        } catch (error) {
            console.error("Error fetching userData/signed contracts:", error);
            setErrorMessage(error?.message || 'Could not load contracts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDriverContracts();
    }, [loadDriverContracts]);

    const selectedSignedContract = useMemo(() => {
        if (!Array.isArray(signedContracts) || signedContracts.length === 0) {
            return null;
        }

        if (selectedTab === 'active') {
            return signedContracts.find((row) => normalizeStatus(row?.status) === STATUS_ACTIVE) || null;
        }

        if (selectedTab === 'upcoming') {
            return (
                signedContracts.find((row) => {
                    const status = normalizeStatus(row?.status);
                    return status === STATUS_IN_PROGRESS || status === STATUS_UNDER_REVIEW;
                }) || null
            );
        }

        return null;
    }, [selectedTab, signedContracts]);

    const serviceVisitSignedContract = useMemo(() => {
        if (!Array.isArray(signedContracts) || signedContracts.length === 0) {
            return null;
        }

        return (
            signedContracts.find((row) => {
                const status = normalizeStatus(row?.status);
                return status === STATUS_IN_PROGRESS;
            }) || null
        );
    }, [signedContracts]);

    useEffect(() => {
        const fetchCampaignData = async () => {
            const contractId = selectedTab === 'service_visit'
                ? serviceVisitSignedContract?.contract_id
                : selectedSignedContract?.contract_id;

            if (contractId == null) {
                setCampaignData(null);
                return;
            }

            try {
                const campaign = await getCampaignById(contractId);
                setCampaignData(campaign);
            } catch (error) {
                console.error("Error fetching campaign data:", error);
                setCampaignData(null);
            }
        };

        fetchCampaignData();
    }, [selectedTab, selectedSignedContract?.contract_id, serviceVisitSignedContract?.contract_id]);

    const handleSegmentChange = (value) => {
        setSelectedTab(value);
    };

    return (
        <View>
            <View style={{marginBottom: 70}}>
                <TopControl setLocalPage={setLocalPage} title="Contracts" switchTo="home"/>
            </View>
            <SegmentedControl_
                options={[
                    {label: 'Active', value: 'active'},
                    {label: 'Upcoming', value: 'upcoming'},
                    {label: 'Service visit', value: 'service_visit'},
                ]}
                value={selectedTab}
                onValueChange={handleSegmentChange}
            />
            <View style={{marginTop: 20}}>
                {!!errorMessage && (
                    <Text style={{fontSize: 14, color: colors.textSecondary, marginBottom: 10}}>{errorMessage}</Text>
                )}

                {selectedTab === "upcoming" && (
                    <View>
                        {(!loading && selectedSignedContract && campaignData)  ? (
                            <ContractItem
                                data={campaignData}
                                status={selectedSignedContract.status}
                                signedAt={selectedSignedContract.signed_at}
                                contractId={selectedSignedContract.contract_id}
                                onStatusUpdated={loadDriverContracts}
                                setSelectedTab={setSelectedTab}
                            />
                        ) : (
                            <Text style={{fontSize: 14, color: colors.textSecondary}}>
                                {loading ? 'Loading upcoming contract...' : 'No upcoming contract found'}
                            </Text>
                        )}
                    </View>
                )}
                {selectedTab === "active" && (
                    <View>
                        {(!loading && selectedSignedContract && campaignData) ? (
                            <ActiveContract
                                data={campaignData}
                                status={selectedSignedContract.status}
                                signedAt={selectedSignedContract.signed_at}
                            />
                        ) : (
                            <Text style={{fontSize: 14, color: colors.textSecondary}}>
                                {loading ? 'Loading active contract...' : 'No active contract found'}
                            </Text>
                        )}
                    </View>
                )
                }
                {selectedTab === "service_visit" && (
                    <View>
                        <ServiceVisit contract={campaignData} />
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    
});
