// Weather utility functions for paragliding pilots

export interface WeatherData {
    temp: number;
    feels_like: number;
    temp_min?: number;
    temp_max?: number;
    pressure: number;
    humidity: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    clouds: number;
    visibility?: number;
    uvi?: number;
    dew_point?: number;
}

export interface ThermalPotential {
    rating: number; // 0-10
    description: string;
    color: string;
}

export interface FlightSuitability {
    rating: number; // 0-10
    description: string;
    color: string;
    warnings: string[];
}

/**
 * Calculate thermal potential based on weather conditions
 * Higher temperature differential, low wind, and partial clouds = better thermals
 */
export function calculateThermalPotential(
    temp: number,
    tempGround: number,
    windSpeed: number,
    cloudCoverage: number,
    hour: number
): ThermalPotential {
    let rating = 0;

    // Temperature differential (ground warmer than air = thermals)
    const tempDiff = tempGround - temp;
    if (tempDiff > 5) rating += 3;
    else if (tempDiff > 3) rating += 2;
    else if (tempDiff > 1) rating += 1;

    // Wind speed (lower is better for thermals)
    if (windSpeed < 10) rating += 3;
    else if (windSpeed < 15) rating += 2;
    else if (windSpeed < 20) rating += 1;

    // Cloud coverage (30-60% is ideal for thermals)
    if (cloudCoverage >= 30 && cloudCoverage <= 60) rating += 2;
    else if (cloudCoverage >= 20 && cloudCoverage <= 70) rating += 1;

    // Time of day (11am-4pm best for thermals)
    if (hour >= 11 && hour <= 16) rating += 2;
    else if (hour >= 10 && hour <= 17) rating += 1;

    // Normalize to 0-10
    rating = Math.min(10, rating);

    let description = '';
    let color = '';

    if (rating >= 8) {
        description = 'Excellent thermal conditions';
        color = 'text-green-400';
    } else if (rating >= 6) {
        description = 'Good thermal potential';
        color = 'text-blue-400';
    } else if (rating >= 4) {
        description = 'Moderate thermals expected';
        color = 'text-yellow-400';
    } else if (rating >= 2) {
        description = 'Weak thermal activity';
        color = 'text-orange-400';
    } else {
        description = 'Poor thermal conditions';
        color = 'text-red-400';
    }

    return { rating, description, color };
}

/**
 * Determine overall flight suitability based on all conditions
 */
export function getFlightSuitability(weather: WeatherData): FlightSuitability {
    let rating = 10;
    const warnings: string[] = [];

    // Wind speed check (critical for safety)
    if (weather.wind_speed > 30) {
        rating -= 5;
        warnings.push('⚠️ Dangerous wind speeds - DO NOT FLY');
    } else if (weather.wind_speed > 25) {
        rating -= 3;
        warnings.push('⚠️ Very strong winds - experienced pilots only');
    } else if (weather.wind_speed > 20) {
        rating -= 2;
        warnings.push('Strong winds - caution advised');
    } else if (weather.wind_speed > 15) {
        rating -= 1;
    }

    // Wind gusts
    if (weather.wind_gust && weather.wind_gust > 35) {
        rating -= 3;
        warnings.push('⚠️ Dangerous gusts detected');
    } else if (weather.wind_gust && weather.wind_gust > 25) {
        rating -= 2;
        warnings.push('Strong gusts - be prepared');
    }

    // Visibility
    if (weather.visibility && weather.visibility < 3000) {
        rating -= 3;
        warnings.push('⚠️ Poor visibility');
    } else if (weather.visibility && weather.visibility < 5000) {
        rating -= 1;
        warnings.push('Reduced visibility');
    }

    // Cloud coverage (100% overcast not ideal)
    if (weather.clouds > 90) {
        rating -= 1;
    }

    // Ensure rating stays in 0-10 range
    rating = Math.max(0, Math.min(10, rating));

    let description = '';
    let color = '';

    if (rating >= 8) {
        description = 'Excellent flying conditions';
        color = 'bg-green-600';
    } else if (rating >= 6) {
        description = 'Good flying conditions';
        color = 'bg-blue-600';
    } else if (rating >= 4) {
        description = 'Fair conditions - caution advised';
        color = 'bg-yellow-600';
    } else if (rating >= 2) {
        description = 'Poor conditions - not recommended';
        color = 'bg-orange-600';
    } else {
        description = 'Dangerous conditions - DO NOT FLY';
        color = 'bg-red-600';
    }

    return { rating, description, color, warnings };
}

/**
 * Convert wind degrees to cardinal direction
 */
export function getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

/**
 * Get UV safety level and recommendations
 */
export function getUVSafetyLevel(uvi: number): { level: string; color: string; advice: string } {
    if (uvi >= 11) {
        return {
            level: 'Extreme',
            color: 'text-purple-400',
            advice: 'Take all precautions - avoid sun exposure'
        };
    } else if (uvi >= 8) {
        return {
            level: 'Very High',
            color: 'text-red-400',
            advice: 'Extra protection needed - seek shade'
        };
    } else if (uvi >= 6) {
        return {
            level: 'High',
            color: 'text-orange-400',
            advice: 'Protection required - wear sunscreen'
        };
    } else if (uvi >= 3) {
        return {
            level: 'Moderate',
            color: 'text-yellow-400',
            advice: 'Protection recommended'
        };
    } else {
        return {
            level: 'Low',
            color: 'text-green-400',
            advice: 'Minimal protection needed'
        };
    }
}

/**
 * Format pressure trend
 */
export function formatPressureTrend(currentPressure: number, previousPressure: number): {
    trend: string;
    icon: string;
    description: string;
} {
    const diff = currentPressure - previousPressure;

    if (diff > 2) {
        return {
            trend: 'Rising rapidly',
            icon: '↑↑',
            description: 'Improving weather expected'
        };
    } else if (diff > 0.5) {
        return {
            trend: 'Rising',
            icon: '↑',
            description: 'Weather improving'
        };
    } else if (diff < -2) {
        return {
            trend: 'Falling rapidly',
            icon: '↓↓',
            description: 'Deteriorating weather expected'
        };
    } else if (diff < -0.5) {
        return {
            trend: 'Falling',
            icon: '↓',
            description: 'Weather deteriorating'
        };
    } else {
        return {
            trend: 'Steady',
            icon: '→',
            description: 'Stable conditions'
        };
    }
}

/**
 * Get moon phase description
 */
export function getMoonPhase(moonPhase: number): { phase: string; icon: string } {
    if (moonPhase === 0 || moonPhase === 1) {
        return { phase: 'New Moon', icon: '🌑' };
    } else if (moonPhase < 0.25) {
        return { phase: 'Waxing Crescent', icon: '🌒' };
    } else if (moonPhase === 0.25) {
        return { phase: 'First Quarter', icon: '🌓' };
    } else if (moonPhase < 0.5) {
        return { phase: 'Waxing Gibbous', icon: '🌔' };
    } else if (moonPhase === 0.5) {
        return { phase: 'Full Moon', icon: '🌕' };
    } else if (moonPhase < 0.75) {
        return { phase: 'Waning Gibbous', icon: '🌖' };
    } else if (moonPhase === 0.75) {
        return { phase: 'Last Quarter', icon: '🌗' };
    } else {
        return { phase: 'Waning Crescent', icon: '🌘' };
    }
}

/**
 * Determine best flying hours based on conditions
 */
export function getFlightWindow(hourlyData: any[]): { start: number; end: number; quality: string } {
    let bestStart = -1;
    let bestEnd = -1;
    let maxScore = 0;
    let currentScore = 0;
    let currentStart = -1;

    hourlyData.forEach((hour, index) => {
        const hourOfDay = new Date(hour.dt * 1000).getHours();
        let score = 0;

        // Prefer midday hours
        if (hourOfDay >= 11 && hourOfDay <= 16) score += 3;
        else if (hourOfDay >= 10 && hourOfDay <= 17) score += 2;
        else if (hourOfDay >= 9 && hourOfDay <= 18) score += 1;

        // Good wind conditions
        if (hour.wind_speed < 15) score += 2;
        else if (hour.wind_speed < 20) score += 1;

        // No precipitation
        if (!hour.rain && !hour.snow) score += 1;

        // Good visibility
        if (hour.visibility >= 10000) score += 1;

        if (score > 5) {
            if (currentStart === -1) currentStart = index;
            currentScore += score;
        } else {
            if (currentScore > maxScore) {
                maxScore = currentScore;
                bestStart = currentStart;
                bestEnd = index - 1;
            }
            currentStart = -1;
            currentScore = 0;
        }
    });

    // Check final window
    if (currentScore > maxScore) {
        bestStart = currentStart;
        bestEnd = hourlyData.length - 1;
    }

    const quality = maxScore > 20 ? 'Excellent' : maxScore > 15 ? 'Good' : maxScore > 10 ? 'Fair' : 'Poor';

    return { start: bestStart, end: bestEnd, quality };
}

/**
 * Convert meters per second to kilometers per hour
 */
export function msToKmh(ms: number): number {
    return Math.round(ms * 3.6);
}

/**
 * Convert meters to kilometers
 */
export function metersToKm(meters: number): number {
    return Math.round(meters / 100) / 10;
}

/**
 * Format temperature with degree symbol
 */
export function formatTemp(temp: number): string {
    return `${Math.round(temp)}°C`;
}

/**
 * Get weather icon URL from OpenWeather
 */
export function getWeatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}
