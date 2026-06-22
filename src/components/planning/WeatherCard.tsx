import { useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Card, Text } from '@/src/components/ui';
import { Icon } from '@/src/components/icons/Icon';
import { colors, spacing, radii } from '@/src/theme';
import { useWeather } from '@/src/stores/weather';
import { weatherMeta, aqiMeta } from '@/src/lib/weatherMeta';
import { fmtISO, parseISO, todayMidday } from '@/src/lib/dates';
import type { Occupation } from '@/src/api/occupations';

const DOW = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

type Props = {
  // Occupations let us mark the forecast days that fall during a stay.
  occupations: Occupation[];
};

export function WeatherCard({ occupations }: Props) {
  const weather = useWeather();
  const todayISO = fmtISO(todayMidday());

  const isDuringStay = useMemo(() => {
    // ISO 'YYYY-MM-DD' compares correctly as a string; inclusive of arrival/departure.
    return (dateISO: string) =>
      occupations.some((o) => o.startDate <= dateISO && dateISO <= o.endDate);
  }, [occupations]);

  if (weather.state === 'loading') {
    return (
      <Card style={styles.card}>
        <View style={styles.msgRow}>
          <ActivityIndicator color={colors.forest} />
          <Text variant="small">Météo en cours…</Text>
        </View>
      </Card>
    );
  }

  if (weather.state === 'error') {
    return (
      <Card style={styles.card}>
        <View style={styles.msgRow}>
          <Text variant="small" color={colors.replace}>
            {weather.errorMessage ?? 'Météo indisponible.'}
          </Text>
          <Pressable onPress={weather.fetch} hitSlop={8}>
            <Text variant="label" color={colors.forest}>
              Réessayer
            </Text>
          </Pressable>
        </View>
      </Card>
    );
  }

  const data = weather.data;
  if (!data) return null;

  const current = data.current;
  const currentMeta = weatherMeta(current.weatherCode);
  const air = aqiMeta(data.airQuality.europeanAqi);

  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <View style={styles.now}>
          <Icon name={currentMeta.icon} size={40} color={colors.forest} />
          <View>
            <Text variant="h2">{Math.round(current.temperature)}°</Text>
            <Text variant="small" color={colors.ink3}>
              Ressenti {Math.round(current.apparentTemperature)}°
            </Text>
          </View>
          <View style={styles.nowMeta}>
            <Text variant="label">{currentMeta.label}</Text>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Icon name="wind" size={14} color={colors.ink3} />
                <Text variant="small" color={colors.ink3}>
                  {Math.round(current.windSpeed)} km/h
                </Text>
              </View>
              <View style={styles.stat}>
                <Icon name="droplet" size={14} color={colors.ink3} />
                <Text variant="small" color={colors.ink3}>
                  {current.humidity} %
                </Text>
              </View>
            </View>
          </View>
        </View>

        {air ? (
          <View style={[styles.aqi, { backgroundColor: air.color + '20' }]}>
            <View style={[styles.aqiDot, { backgroundColor: air.color }]} />
            <Text variant="small" color={air.color} weight="700">
              Air {air.label}
            </Text>
          </View>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.forecast}
      >
        {data.daily.map((d) => {
          const meta = weatherMeta(d.weatherCode);
          const isToday = d.date === todayISO;
          const isStay = isDuringStay(d.date);
          return (
            <View
              key={d.date}
              style={[styles.day, isToday && styles.dayToday, isStay && styles.dayStay]}
            >
              <Text variant="mono" color={colors.ink3}>
                {isToday
                  ? 'Auj.'
                  : `${DOW[(parseISO(d.date).getDay() + 6) % 7]} ${parseISO(d.date).getDate()}`}
              </Text>
              <Icon name={meta.icon} size={22} color={colors.forest} />
              <View style={styles.dayTemps}>
                <Text variant="small" weight="700">
                  {Math.round(d.tempMax)}°
                </Text>
                <Text variant="small" color={colors.ink3}>
                  {Math.round(d.tempMin)}°
                </Text>
              </View>
              {d.snowfall > 0 ? (
                <Text variant="mono" color="#6aa9d8">
                  {d.snowfall} cm
                </Text>
              ) : d.precipitation > 0 ? (
                <Text variant="mono" color="#3a7bd5">
                  {d.precipitation} mm
                </Text>
              ) : (
                <Text variant="mono" color={colors.line}>
                  ·
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  now: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  nowMeta: {
    gap: spacing.xxs,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  aqi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
  },
  aqiDot: {
    width: 9,
    height: 9,
    borderRadius: radii.pill,
  },
  forecast: {
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  day: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    minWidth: 58,
  },
  dayToday: {
    backgroundColor: colors.sageBg,
  },
  dayStay: {
    borderWidth: 2,
    borderColor: colors.forest,
  },
  dayTemps: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
});
