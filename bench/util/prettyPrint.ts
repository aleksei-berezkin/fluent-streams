export function prettyPrint(hz: number) {
    // 999_500_000 -> 1.00G
    // 999_499_999 -> 999M
    if (hz >= 999_500_000) {
        return doPrettyPrint(hz / 1_000_000_000, 'G')
    }
    if (hz >= 999_500) {
        return doPrettyPrint(hz / 1_000_000, 'M')
    }
    if (hz >= 999.5) {
        return doPrettyPrint(hz / 1_000, 'k');
    }
    if (hz >= .9995) {
        return doPrettyPrint(hz, '');
    }
    if (hz >= .09995) {
        return formatter(3).format(hz);
    }
    return String(hz);
}

function doPrettyPrint(hz: number, suffix: string) {
    if (hz >= 100) {
        return formatter(0).format(hz) + suffix;
    }
    if (hz >= 10) {
        return formatter(1).format(hz) + suffix;
    }
    return formatter(2).format(hz) + suffix;
}

function formatter(fractionDigits: number) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
        useGrouping: false
    });
}
