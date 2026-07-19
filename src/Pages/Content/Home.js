import {View, ScrollView, Text, Image, StyleSheet} from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from "../../components/service/supabase";
import {Feather} from '@expo/vector-icons';
import {colors} from '../../styles/theme';

// COMPONENTS
import {Week} from '../../components/ui/Week';
import HowItWorks from '../../components/screens/HowItWorks';
import {StatusBar_} from '../../components/ui/statusBar';
import Map from '../../components/ui/Map';
import { StatsInfo } from '../../components/ui/StatsInfo';
// ----------------------------------------------------------

// SCREENS
import Loading from '../../components/screens/Loading';
// ----------------------------------------------------------

// SERVICES
import {getUserDataById, getTasks} from '../../components/service/service';
// ----------------------------------------------------------

const normalizeWeeklyStat = (weeklyStat) => {
    if (!weeklyStat) {
        return {distance: [], hours: []};
    }

    if (typeof weeklyStat === 'string') {
        try {
            const parsed = JSON.parse(weeklyStat);
            return {
                distance: Array.isArray(parsed?.distance) ? parsed.distance : [],
                hours: Array.isArray(parsed?.hours) ? parsed.hours : [],
            };
        } catch {
            return {distance: [], hours: []};
        }
    }

    return {
        distance: Array.isArray(weeklyStat?.distance) ? weeklyStat.distance : [],
        hours: Array.isArray(weeklyStat?.hours) ? weeklyStat.hours : [],
    };
};

const formatTaskMetric = (value, fieldName) => {
    const numericValue = Number(value) || 0;
    const normalizedFieldName = String(fieldName || '').toLowerCase();

    if (normalizedFieldName.includes('distance') || normalizedFieldName.includes('km')) {
        return `${numericValue.toFixed(1)} km`;
    }

    if (normalizedFieldName.includes('hourse') || normalizedFieldName.includes('hours')) {
        return `${numericValue.toFixed(1)} h`;
    }

    return String(numericValue.toFixed(1));
};

export default function Home({email, setLocalPage}) {
    const [showHowItWorks, setShowHowItWorks] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [userData, setUserData] = React.useState(null);
    const [tasks, setTasks] = React.useState(null);

    const mapCoordinate = React.useMemo(() => {
        const latitude = Number(userData?.lat);
        const longitude = Number(userData?.lan);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null;
        }

        return {
            latitude,
            longitude,
        };
    }, [userData?.lat, userData?.lan]);

    const resolvedTasks = React.useMemo(() => {
        if (!Array.isArray(tasks) || !userData) {
            return [];
        }

        return tasks.map((task) => {
            const targetColumnFromTaskTarget = String(task?.task_target || '').trim();
            const targetColumnFromLegacyField = String(task?.task_value_column_name || '').trim();

            let valueColumnName = targetColumnFromTaskTarget;

            if (!valueColumnName || !(valueColumnName in userData)) {
                valueColumnName = targetColumnFromLegacyField;
            }

            const currentValue = Number(userData?.[valueColumnName]) || 0;
            const numericTarget = Number(task?.task_target);
            const hasNumericTarget = Number.isFinite(numericTarget) && numericTarget > 0;
            const progressPercent = hasNumericTarget
                ? (currentValue / numericTarget) * 100
                : Math.max(0, Math.min(100, currentValue));

            return {
                ...task,
                valueColumnName,
                currentValue,
                taskTarget: hasNumericTarget ? numericTarget : null,
                progressPercent: Math.max(0, Math.min(100, progressPercent)),
                leftLabel: hasNumericTarget
                    ? `${formatTaskMetric(currentValue, valueColumnName)} / ${formatTaskMetric(numericTarget, valueColumnName)}`
                    : formatTaskMetric(currentValue, valueColumnName),
                rightText: hasNumericTarget
                    ? `${Math.max(0, Math.min(100, progressPercent)).toFixed(0)}%`
                    : formatTaskMetric(currentValue, valueColumnName),
            };
        });
    }, [tasks, userData]);

    React.useEffect(() => {
        const initialize = async () => {
            try {
                const completed = await AsyncStorage.getItem(
                    'howItWorksCompleted'
                );

                setShowHowItWorks(completed !== 'true');

                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (user) {
                    const userData = await getUserDataById(user.id);
                    const normalizedUserData = {
                        ...userData,
                        weeklyStat: normalizeWeeklyStat(userData?.weeklyStat),
                    };

                    setUserData(normalizedUserData);
                    // Add user data to the LocalStorage to get access from any screen
                    await AsyncStorage.setItem(
                        'userData',
                        JSON.stringify(normalizedUserData)
                    );

                    try {
                        const tasks = await getTasks();
                        console.log('[Tasks] payload:', JSON.stringify(tasks, null, 2));
                        setTasks(tasks);
                        if (tasks.length === 0) {
                            console.log(
                                '[Tasks] empty result. Check Supabase RLS and task assignment fields (user_id/userid/driver_email/email/fleet/carid).'
                            );
                        }
                    } catch (tasksError) {
                        console.log('[Tasks] fetch failed:', tasksError?.message || tasksError);
                    }

                    console.log('User Data:', JSON.stringify(normalizedUserData, null, 2)); // Remove this line after debugging
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, []);

    if (loading || !userData) {
        return <Loading />;
    }
    const text = 'Your Profile in Review, Please wait\nfor the verification process to complete.';
    return (
        <ScrollView>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {userData?.selfie ? (
                        <Image source={{uri: userData.selfie}} style={styles.selfie} />
                    ) : (
                        <View style={styles.selfiePlaceholder}>
                            <Feather name="user" size={20} color={colors.textSecondary} />
                        </View>
                    )}
                    <Text style={[styles.text, { marginLeft: 8 }]}>Welcome, {userData?.name || 'Driver'}</Text>
                </View>
            </View>
            <Week />
            {
                userData?.status === 'In Progress' && (
                    <StatusBar_ 
                        style={{ marginTop: 25 }}
                        title="Verification Needed"
                        description={text}
                        icon="alert-triangle"
                        color="#DC362E"
                        onPress={() => alert(text)}
                    />
                )
            }

            <Map coordinate={mapCoordinate} />

            <View>
                <Text style={styles.sectionTitle}>Contract Forecast</Text>
                <StatsInfo 
                    title="Contract Task"
                    value={userData?.current_week_distance || 45}
                    description={'50 000 you can earn this month'}
                />
            </View>
            {resolvedTasks.length > 0 && (
                <View  style={{marginBottom: 100}}>
                    <Text style={styles.sectionTitle}>Bonus Tasks</Text>
                    {resolvedTasks.map((task) => (
                        <StatsInfo 
                            key={task.id}
                            title={task.task_name}
                            value={task.progressPercent}
                            description={`${task.leftLabel}`}
                            rightText={task.rightText}
                        />
                    ))}
                </View>
            )}






            {showHowItWorks && (
                <HowItWorks
                    onComplete={async () => {
                        await AsyncStorage.setItem(
                            'howItWorksCompleted',
                            'true'
                        );

                        setShowHowItWorks(false);
                    }}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        color: '#fff',
        fontFamily: 'LufgaRegular',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    selfie: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    selfiePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#202020',
        borderWidth: 1,
        borderColor: '#151515',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'LufgaMedium',
        color: '#fff',
        marginTop: 20,
    },
});