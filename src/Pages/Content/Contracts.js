import {View, Text, StyleSheet, Image, Pressable} from "react-native";
import React, {useEffect, useState} from "react";
import {colors} from "../../styles/theme";

// COMPONENTS
import {SegmentedControl_} from "../../components/ui/segmentedControl";
import {TopControl} from "../../components/ui/topControl";
import {ContractItem} from "../../components/ui/ContractItem";
// --------------------------------------------------------------

// Services
import {getCampaignById} from "../../components/service/service";
// --------------------------------------------------------------

export default function Contracts({setLocalPage, contractId}) {
    const [selectedTab, setSelectedTab] = useState("active");
    const [contractData, setContractData] = useState(null);
    useEffect(() => {
        const fetchContractData = async () => {
            try {
                const data = await getCampaignById(contractId);
                console.log("Contract Data:", data);
                setContractData(data);
            } catch (error) {
                console.error("Error fetching contract data:", error);
            }
        };
        fetchContractData();
    }, []);
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
                    {label: 'Service visit', value: 'service_visit'},
                ]}
                value={selectedTab}
                onValueChange={handleSegmentChange}
            />
            <View style={{marginTop: 20}}>
                {selectedTab === "active" && (
                    <View>
                        {contractData ? (
                            <ContractItem data={contractData}/>
                        ) : (
                            <Text style={{fontSize: 14, color: colors.textSecondary}}>No active contract found</Text>
                        )}
                    </View>
                )}
                {selectedTab === "service_visit" && (
                    <View>
                        <Text style={{fontSize: 18, fontWeight: 'bold', color: colors.textPrimary}}>Service Visit Contracts</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    
});