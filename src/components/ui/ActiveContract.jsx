import {View, Text, StyleSheet, Image} from "react-native";
import React from "react";
import {colors, typography} from "../../styles/theme";

const parseCampaignDuration = (duration) => {
    const durationText = String(duration || '').trim().toLowerCase();
    const match = durationText.match(/^(\d+)\s*([dwmy])$/i);

    if (!match) {
        return null;
    }

    return {
        amount: Number(match[1]),
        unit: match[2].toLowerCase(),
    };
};

const addDurationToDate = (startDate, duration) => {
    const parsedDuration = parseCampaignDuration(duration);

    if (!parsedDuration || !Number.isFinite(parsedDuration.amount) || parsedDuration.amount <= 0) {
        return null;
    }

    const endDate = new Date(startDate);

    if (parsedDuration.unit === 'd') {
        endDate.setDate(endDate.getDate() + parsedDuration.amount);
        return endDate;
    }

    if (parsedDuration.unit === 'w') {
        endDate.setDate(endDate.getDate() + (parsedDuration.amount * 7));
        return endDate;
    }

    if (parsedDuration.unit === 'm') {
        endDate.setMonth(endDate.getMonth() + parsedDuration.amount);
        return endDate;
    }

    if (parsedDuration.unit === 'y') {
        endDate.setFullYear(endDate.getFullYear() + parsedDuration.amount);
        return endDate;
    }

    return null;
};

const formatDateTimeLabel = (value) => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(date);
};

export function ActiveContract({data, status, signedAt}) {
    const contractEndDate = React.useMemo(() => {
        if (!data?.created_at) {
            return null;
        }

        return addDurationToDate(new Date(data.created_at), data.duration);
    }, [data?.created_at, data?.duration]);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.contractMeta}>
                    <Image source={{uri: data.document}} style={styles.image} />
                    <View style={styles.contractTextBlock}>
                        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{data.name}</Text>
                        <Text style={styles.description} numberOfLines={1} ellipsizeMode="tail">{data.city}</Text>
                    </View>
                </View>
                <View style={styles.status}>
                    <Text style={styles.statusText}>{status}</Text>
                </View>
            </View>
            <View>
                <Text style={styles.description}>Contract ends: {formatDateTimeLabel(contractEndDate)}</Text>
                {!!signedAt && <Text style={styles.description}>Signed at: {formatDateTimeLabel(signedAt)}</Text>}
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: 8,
        marginBottom: 10,
    },
    headerRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    contractMeta: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        minWidth: 0,
    },
    contractTextBlock: {
        flex: 1,
        minWidth: 0,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    status: {
        marginTop: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: "#FFC107",
        padding: 5,
        paddingHorizontal: 10,
        borderRadius: 100,
        alignItems: 'center',
        marginLeft: 10,
        flexShrink: 0,
    },
    statusText: {
        fontSize: 12,
        color: colors.textPrimary,
        fontFamily: typography.familyRegular,
    },
    sidePick: {
        flex: 1,
        width: 100,
        height: 100,
        padding: 10,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 10,
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
    },
    sideText: {
        color: colors.textPrimary,
        fontFamily: typography.familyRegular,
    }
});