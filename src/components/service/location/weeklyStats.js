const EARTH_RADIUS_KM = 6371;
const WEEK_STATS_SIZE = 4;
const ZERO_DISTANCE_LABEL = '0km';
const ZERO_HOURS_LABEL = '0 h';
const MIN_SEGMENT_DISTANCE_KM = 0.02;
const MAX_SEGMENT_DURATION_HOURS = 0.5;

const toFiniteNumber = (value, fallback = 0) => {
    const nextValue = Number(value);
    return Number.isFinite(nextValue) ? nextValue : fallback;
};

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const haversineKm = (from, to) => {
    const lat1 = toFiniteNumber(from?.latitude, NaN);
    const lon1 = toFiniteNumber(from?.longitude, NaN);
    const lat2 = toFiniteNumber(to?.latitude, NaN);
    const lon2 = toFiniteNumber(to?.longitude, NaN);

    if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) {
        return 0;
    }

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(toRadians(lat1))
            * Math.cos(toRadians(lat2))
            * Math.sin(dLon / 2)
            * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
};

const formatDistanceLabel = (valueKm) => {
    const value = Math.max(0, toFiniteNumber(valueKm, 0));

    if (value === 0) {
        return ZERO_DISTANCE_LABEL;
    }

    return `${value.toFixed(1)}km`;
};

const formatHoursLabel = (valueHours) => {
    const value = Math.max(0, toFiniteNumber(valueHours, 0));

    if (value === 0) {
        return ZERO_HOURS_LABEL;
    }

    return `${value.toFixed(1)} h`;
};

const createWeeklyDistanceItem = (value, weekIndex) => {
    const nextValue = Math.max(0, toFiniteNumber(value, 0));
    return {
        label: `Week ${weekIndex + 1}`,
        value: Number(nextValue.toFixed(2)),
        data: formatDistanceLabel(nextValue),
    };
};

const createWeeklyHoursItem = (value, weekIndex) => {
    const nextValue = Math.max(0, toFiniteNumber(value, 0));
    return {
        label: `Week ${weekIndex + 1}`,
        value: Number(nextValue.toFixed(2)),
        data: formatHoursLabel(nextValue),
    };
};

const normalizeWeeklyArray = (items, key) => {
    const array = Array.isArray(items) ? items : [];

    return Array.from({length: WEEK_STATS_SIZE}, (_, index) => {
        const source = array[index] || {};
        const value = toFiniteNumber(source?.value, 0);

        if (key === 'distance') {
            return createWeeklyDistanceItem(value, index);
        }

        return createWeeklyHoursItem(value, index);
    });
};

const normalizeWeeklyStatWithMeta = (weeklyStat) => {
    const source =
        typeof weeklyStat === 'string'
            ? (() => {
                try {
                    return JSON.parse(weeklyStat);
                } catch {
                    return null;
                }
            })()
            : weeklyStat;

    return {
        distance: normalizeWeeklyArray(source?.distance, 'distance'),
        hours: normalizeWeeklyArray(source?.hours, 'hours'),
        _meta: {
            weekKey: typeof source?._meta?.weekKey === 'string' ? source._meta.weekKey : null,
        },
    };
};

const getUtcWeekStart = (dateLike) => {
    const date = new Date(dateLike);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const utcDate = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
    const dayOfWeek = utcDate.getUTCDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    utcDate.setUTCDate(utcDate.getUTCDate() + diffToMonday);
    return utcDate;
};

const getWeekKey = (dateLike) => {
    const monday = getUtcWeekStart(dateLike);

    if (!monday) {
        return null;
    }

    return monday.toISOString().slice(0, 10);
};

const getWeekShiftCount = (fromWeekKey, toWeekKey) => {
    if (!fromWeekKey || !toWeekKey) {
        return 0;
    }

    const from = new Date(`${fromWeekKey}T00:00:00.000Z`);
    const to = new Date(`${toWeekKey}T00:00:00.000Z`);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        return 0;
    }

    const diffMs = to.getTime() - from.getTime();
    const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));

    return Math.max(0, diffWeeks);
};

const toKmhFromMetersPerSecond = (speed) => {
    const metersPerSecond = toFiniteNumber(speed, 0);
    return metersPerSecond * 3.6;
};

const shouldCountDrivingSegment = ({fromPoint, toPoint, distanceKm, durationHours, minSpeedKmh}) => {
    if (distanceKm < MIN_SEGMENT_DISTANCE_KM || durationHours <= 0) {
        return false;
    }

    // Drop stale gaps between points to avoid counting parked/offline time as driving hours.
    if (durationHours > MAX_SEGMENT_DURATION_HOURS) {
        return false;
    }

    const fromSpeedKmh = toKmhFromMetersPerSecond(fromPoint?.speed);
    const toSpeedKmh = toKmhFromMetersPerSecond(toPoint?.speed);
    const measuredSpeedKmh = Math.max(fromSpeedKmh, toSpeedKmh);
    const calculatedSpeedKmh = distanceKm / durationHours;
    const segmentSpeedKmh = Math.max(measuredSpeedKmh, calculatedSpeedKmh);

    return segmentSpeedKmh >= minSpeedKmh;
};

const buildSortedPoints = ({previousPoint, locationUpdates}) => {
    const normalizedUpdates = (Array.isArray(locationUpdates) ? locationUpdates : [])
        .map((update) => {
            const timestamp = Number(update?.timestamp);

            if (!Number.isFinite(update?.latitude) || !Number.isFinite(update?.longitude)) {
                return null;
            }

            if (!Number.isFinite(timestamp)) {
                return null;
            }

            return {
                latitude: Number(update.latitude),
                longitude: Number(update.longitude),
                speed: update.speed,
                timestamp,
            };
        })
        .filter(Boolean);

    const initialPoint = previousPoint
        && Number.isFinite(previousPoint?.latitude)
        && Number.isFinite(previousPoint?.longitude)
        && Number.isFinite(Number(previousPoint?.timestamp))
        ? {
            latitude: Number(previousPoint.latitude),
            longitude: Number(previousPoint.longitude),
            speed: previousPoint.speed,
            timestamp: Number(previousPoint.timestamp),
        }
        : null;

    const points = initialPoint ? [initialPoint, ...normalizedUpdates] : normalizedUpdates;

    return points.sort((a, b) => a.timestamp - b.timestamp);
};

const calculateBatchStats = ({previousPoint, locationUpdates, minSpeedKmh}) => {
    const points = buildSortedPoints({previousPoint, locationUpdates});

    if (points.length < 2) {
        return {distanceKm: 0, hours: 0};
    }

    let distanceKm = 0;
    let hours = 0;

    for (let index = 1; index < points.length; index += 1) {
        const fromPoint = points[index - 1];
        const toPoint = points[index];
        const durationMs = toPoint.timestamp - fromPoint.timestamp;
        const durationHours = durationMs > 0 ? durationMs / (1000 * 60 * 60) : 0;
        const segmentDistanceKm = haversineKm(fromPoint, toPoint);

        if (
            shouldCountDrivingSegment({
                fromPoint,
                toPoint,
                distanceKm: segmentDistanceKm,
                durationHours,
                minSpeedKmh,
            })
        ) {
            distanceKm += segmentDistanceKm;
            hours += durationHours;
        }
    }

    return {
        distanceKm: Number(distanceKm.toFixed(4)),
        hours: Number(hours.toFixed(4)),
    };
};

const shiftWeeklyStats = ({weeklyStat, shiftCount, finishedWeekDistance, finishedWeekHours}) => {
    if (shiftCount <= 0) {
        return weeklyStat;
    }

    const shiftSteps = Math.min(WEEK_STATS_SIZE, shiftCount);
    let distance = [...weeklyStat.distance];
    let hours = [...weeklyStat.hours];

    for (let step = 0; step < shiftSteps; step += 1) {
        const distanceValue = step === 0 ? finishedWeekDistance : 0;
        const hoursValue = step === 0 ? finishedWeekHours : 0;

        distance = [createWeeklyDistanceItem(distanceValue, 0), ...distance]
            .slice(0, WEEK_STATS_SIZE)
            .map((item, index) => createWeeklyDistanceItem(item.value, index));

        hours = [createWeeklyHoursItem(hoursValue, 0), ...hours]
            .slice(0, WEEK_STATS_SIZE)
            .map((item, index) => createWeeklyHoursItem(item.value, index));
    }

    return {
        ...weeklyStat,
        distance,
        hours,
    };
};

export const buildWeeklyStatsUpdate = ({
    weeklyStat,
    currentWeekDistance,
    currentWeekHours,
    previousPoint,
    locationUpdates,
    minSpeedKmh,
    referenceTimestamp,
}) => {
    const normalizedWeeklyStat = normalizeWeeklyStatWithMeta(weeklyStat);
    const batchStats = calculateBatchStats({
        previousPoint,
        locationUpdates,
        minSpeedKmh,
    });

    const safeCurrentDistance = Math.max(0, toFiniteNumber(currentWeekDistance, 0));
    const safeCurrentHours = Math.max(0, toFiniteNumber(currentWeekHours, 0));

    const currentWeekKey = getWeekKey(referenceTimestamp || Date.now());
    const previousWeekKey = normalizedWeeklyStat._meta.weekKey;
    const weekShiftCount = getWeekShiftCount(previousWeekKey, currentWeekKey);

    let rolledWeeklyStat = normalizedWeeklyStat;
    let rolledCurrentDistance = safeCurrentDistance;
    let rolledCurrentHours = safeCurrentHours;

    if (weekShiftCount > 0) {
        rolledWeeklyStat = shiftWeeklyStats({
            weeklyStat: rolledWeeklyStat,
            shiftCount: weekShiftCount,
            finishedWeekDistance: rolledCurrentDistance,
            finishedWeekHours: rolledCurrentHours,
        });

        rolledCurrentDistance = 0;
        rolledCurrentHours = 0;
    }

    const nextCurrentDistance = Number(
        (rolledCurrentDistance + batchStats.distanceKm).toFixed(4)
    );
    const nextCurrentHours = Number((rolledCurrentHours + batchStats.hours).toFixed(4));

    const distance = [...rolledWeeklyStat.distance];
    const hours = [...rolledWeeklyStat.hours];

    distance[0] = createWeeklyDistanceItem(nextCurrentDistance, 0);
    hours[0] = createWeeklyHoursItem(nextCurrentHours, 0);

    return {
        weeklyStat: {
            ...rolledWeeklyStat,
            distance,
            hours,
            _meta: {
                weekKey: currentWeekKey,
            },
        },
        currentWeekDistance: nextCurrentDistance,
        currentWeekHours: nextCurrentHours,
        batchDistanceKm: batchStats.distanceKm,
        batchHours: batchStats.hours,
        weekShiftCount,
    };
};