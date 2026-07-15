import {View, Text, Image, StyleSheet, Pressable, ScrollView} from 'react-native';
import React from 'react';
import {colors, radius, spacing, typography} from '../../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from "@expo/vector-icons";
// COMPONENT
import { TopControl } from '../../components/ui/topControl';
import { ProfileInfoBlock } from '../../components/ui/profileInfoBlock';
import { ScoreBreakdown } from '../../components/ui/ScoreBreakdown';
import { SegmentedControl_ } from '../../components/ui/segmentedControl';
import { Chart } from '../../components/ui/Chart';
// ----------------------------------------------------------

export default function Profile ({setLocalPage}) {
    const [userData, setUserData] = React.useState(null);
    const [chartState, setChartState] = React.useState('distance'); // 'distance' or 'hours'
    React.useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDataString = await AsyncStorage.getItem('userData');
                if (userDataString) {
                    const userData = JSON.parse(userDataString);
                    setUserData(userData);
                }
            } catch (error) {
                console.error('Error fetching user data from AsyncStorage:', error);
            }
        };

        fetchUserData();
    }, []);

    const daysSinceRegistration = React.useMemo(() => {
        if (!userData?.created_at) return 1;

        const createdAt = new Date(userData.created_at);
        if (Number.isNaN(createdAt.getTime())) return 1;

        const now = new Date();
        const diffInMs = now - createdAt;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        return Math.max(1, diffInDays);
    }, [userData?.created_at]);

    const totalDistance = Number(userData?.totaldistance) || 0;
    const totalZoneHours = Number(userData?.zonehourse) || 0;

    const avgDistancePerDay = (totalDistance / daysSinceRegistration).toFixed(1);
    const avgZoneHoursPerDay = (totalZoneHours / daysSinceRegistration).toFixed(1);
 // Get this data from DB 
    const safety = 70;
    const acceptance = 51;
    const activity = 68;

    const score = Math.round((safety + acceptance + activity) / 3);

    return (
        <ScrollView style={{marginBottom: 100}}>
            <View style={styles.topControll}>
                <TopControl setLocalPage={() => setLocalPage("home")} title="My Profile" additionalBTN="settings" setLocalPage={setLocalPage} switchTo="home"/>
            </View>
            <View style={styles.profileContent}>
                <View style={styles.profileHeaderRow}>
                    <View style={styles.avatarContainer}>
                        {userData && <Image source={{uri: userData.selfie}} style={styles.selfie} />}
                        <Pressable onPress={() => alert('Edit pressed')} style={styles.edit}>
                            <Feather name="edit" size={16} color="white" />
                        </Pressable>
                    </View>
                    <View>
                        <Text style={styles.text}>Evening {userData?.name}</Text>
                        <View style={{display: "flex", flexDirection: "row", alignItems: "center", gap: 5}}>
                            <Feather name="star" size={14} color={colors.accent} style={{marginRight: 5, marginTop: 5}} />
                            <Text style={styles.text}>{score}%</Text>
                        </View>
                    </View>
                </View>
                <ScoreBreakdown safety={safety} acceptance={acceptance} activity={activity}/>
                <View style={styles.metricsRow}>
                    <ProfileInfoBlock title="Distance" value={totalDistance} description={`AVG ${avgDistancePerDay} km/ day`}/>
                    <ProfileInfoBlock title="Zone Hours" value={totalZoneHours} description={`AVG ${avgZoneHoursPerDay} hrs/ day`}/>
                </View>
            </View>
            <View style={{marginTop: 10}}>
                <SegmentedControl_ 
                    options={[
                        { label: 'Distance', value: 'distance' },
                        { label: 'Hours', value: 'hours' },
                    ]}
                    value={chartState}
                    onValueChange={(value) => setChartState(value)}
                />
                <View style={{marginTop: 20}}>
                    {chartState === 'distance' && <Chart data={
                        [
                            { lable: "Week 1", value: ((100/100)*100), data: "100km" },
                            { lable: "Week 2", value: ((120/100)*100), data: "120km" },
                            { lable: "Week 3", value: ((140/100)*100), data: "140km" },
                            { lable: "Week 4", value: ((130/100)*100), data: "130km" },
                        ] || []} />}
                    {chartState === 'hours' && <Chart data={[
                            { lable: "Week 1", value: ((12/100)*100), data: "12 h" },
                            { lable: "Week 2", value: ((10/100)*100), data: "10 h" },
                            { lable: "Week 3", value: ((15/100)*100), data: "15 h" },
                            { lable: "Week 4", value: ((8/100)*100), data: "8 h" },
                        ] || []} />}
                </View>
            </View>
        </ScrollView>
    )
} 


const styles = StyleSheet.create({
    text: {
        width: 200,
        color: "white",
        fontSize: typography.sizeMd,
        fontFamily: typography.familyRegular,
        marginTop: spacing.sm,
    },

    topControll: {
        marginBottom: 30,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative"
    },
    profileContent: {
        marginTop: 20,
        width: "100%",
    },
    profileHeaderRow: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 95,
        height: 95,
        position: "relative",
    },
    metricsRow: {
        marginTop: 20,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 20,
    },
    selfie: {
        width: 95,
        height: 95,
        borderRadius: 95,
    },
    edit: {
        width: 30,
        height: 30,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: colors.iconBG,
        borderRadius: 25,
        padding: spacing.xs,
    },
})