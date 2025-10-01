import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

const getGlobalStats = async () => {
    const raw = await AsyncStorage.getItem("playerStats");
    const allStats = raw ? JSON.parse(raw) : {};

    let impostorGames = 0;
    let impostorWins = 0;
    let crewmateGames = 0;
    let crewmateWins = 0;

    Object.values(allStats).forEach((s: any) => {
        impostorGames += s.impostorGames || 0;
        impostorWins += s.impostorWins || 0;
        crewmateGames += s.crewmateGames || 0;
        crewmateWins += s.crewmateWins || 0;
    });

    const totalGames = await AsyncStorage.getItem("totalGames") || 0;

    return {
        totalGames,
        impostorWinRate: impostorGames > 0 ? (impostorWins / impostorGames) * 100 : 0,
        crewmateWinRate: crewmateGames > 0 ? (crewmateWins / crewmateGames) * 100 : 0,
        allStats,
    };
};

const Stats = () => {
    const [globalStats, setGlobalStats] = useState<any>(null);
    const [playerStats, setPlayerStats] = useState<any>({});
    const [showGlobal, setShowGlobal] = useState(true);

    useEffect(() => {

        const loadStats = async () => {
            const data = await getGlobalStats();
            setGlobalStats(data);
            setPlayerStats(data.allStats);
        };
        loadStats();
    }, []);

    if (!globalStats) return <Text style={styles.loading}>Cargando...</Text>;

    return (
        <LinearGradient colors={["#232427", "#393b3f"]} style={styles.gradient}>
            <View style={styles.innerContainer}>
                {/* --- Tabs --- */}
                <View style={styles.tabsRow}>
                    <Pressable
                        onPress={() => setShowGlobal(true)}
                        style={[styles.tabButton, showGlobal && styles.tabButtonActive]}
                    >
                        <Text style={[styles.tabText, showGlobal && styles.tabTextActive]}>📊 Global</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setShowGlobal(false)}
                        style={[styles.tabButton, !showGlobal && styles.tabButtonActive]}
                    >
                        <Text style={[styles.tabText, !showGlobal && styles.tabTextActive]}>👤 Por Jugador</Text>
                    </Pressable>
                </View>
                <Text style={styles.totalGames}>Total de partidas: <Text style={{fontWeight:'bold'}}>{globalStats.totalGames}</Text></Text>
                {showGlobal ? (
                    <View>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Impostores</Text>
                            <FlatList
                                data={Object.entries(playerStats).sort((a: any, b: any) => b[1].impostorGames - a[1].impostorGames)}
                                keyExtractor={([name]) => name}
                                renderItem={({ item }) => {
                                    const [name, s]: any = item;
                                    return (
                                        <View style={styles.statRow}>
                                            <Text style={styles.playerName}>{name}</Text>
                                            <Text style={styles.statValue}>{s.impostorGames} <Text style={{color:'#43c96e'}}>({s.impostorWins} victorias)</Text></Text>
                                        </View>
                                    );
                                }}
                            />
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Victorias como impostor</Text>
                            <FlatList
                                data={Object.entries(playerStats).sort((a: any, b: any) => {
                                    const [, sA] = a;
                                    const [, sB] = b;
                                    const rateA = sA.impostorGames > 0 ? sA.impostorWins / sA.impostorGames : 0;
                                    const rateB = sB.impostorGames > 0 ? sB.impostorWins / sB.impostorGames : 0;
                                    return rateB - rateA;
                                })}
                                keyExtractor={([name]) => name}
                                renderItem={({ item }) => {
                                    const [name, s]: any = item;
                                    return (
                                        <View style={styles.statRow}>
                                            <Text style={styles.playerName}>{name}</Text>
                                            <Text style={styles.statValue}>{s.impostorGames === 0 ? '0%' : `${(s.impostorWins / s.impostorGames * 100).toFixed(1)}%`} <Text style={{color:'#43c96e'}}>({s.impostorWins}/{s.impostorGames})</Text></Text>
                                        </View>
                                    );
                                }}
                            />
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Victorias totales</Text>
                            <FlatList
                                data={Object.entries(playerStats).sort((a: any, b: any) => {
                                    const [, sA] = a;
                                    const [, sB] = b;
                                    const rateA = sA.gamesPlayed > 0 ? (sA.impostorWins + sA.crewmateWins) / sA.gamesPlayed : 0;
                                    const rateB = sB.gamesPlayed > 0 ? (sB.impostorWins + sB.crewmateWins) / sB.gamesPlayed : 0;
                                    return rateB - rateA;
                                })}
                                keyExtractor={([name]) => name}
                                renderItem={({ item }) => {
                                    const [name, s]: any = item;
                                    return (
                                        <View style={styles.statRow}>
                                            <Text style={styles.playerName}>{name}</Text>
                                            <Text style={styles.statValue}>{(s.impostorWins + s.crewmateWins) === 0 ? '0%' : `${(((s.impostorWins + s.crewmateWins) / s.gamesPlayed) * 100).toFixed(1)}%`} <Text style={{color:'#43c96e'}}>({s.impostorWins + s.crewmateWins}/{s.gamesPlayed})</Text></Text>
                                        </View>
                                    );
                                }}
                            />
                        </View>
                    </View>
                ) : (
                    <View>
                        <Text style={[styles.cardTitle, { marginTop: 20 }]}>👤 Estadísticas por Jugador</Text>
                        <FlatList
                            data={Object.entries(playerStats)}
                            keyExtractor={([name]) => name}
                            renderItem={({ item }) => {
                                const [name, s]: any = item;
                                return (
                                    <View style={styles.card}>
                                        <Text style={styles.playerName}>{name}</Text>
                                        <Text style={styles.statValue}>Partidas jugadas: <Text style={{fontWeight:'bold'}}>{s.gamesPlayed}</Text></Text>
                                        <Text style={styles.statValue}>Impostor → <Text style={{color:'#ff4e4e'}}>{s.impostorGames}</Text> partidas, <Text style={{color:'#43c96e'}}>{s.impostorWins}</Text> victorias (<Text style={{color:'#43c96e'}}>{s.impostorGames > 0 ? ((s.impostorWins / s.impostorGames) * 100).toFixed(1) : 0}%</Text>)</Text>
                                        <Text style={styles.statValue}>Crewmate → <Text style={{color:'#4e9cff'}}>{s.crewmateGames}</Text> partidas, <Text style={{color:'#43c96e'}}>{s.crewmateWins}</Text> victorias (<Text style={{color:'#43c96e'}}>{s.crewmateGames > 0 ? ((s.crewmateWins / s.crewmateGames) * 100).toFixed(1) : 0}%</Text>)</Text>
                                    </View>
                                );
                            }}
                        />
                    </View>
                )}
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    innerContainer: { flex: 1, padding: 20 },
    tabsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, justifyContent: 'center' },
    tabButton: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 6, borderWidth: 1, borderColor: 'transparent', },
    tabButtonActive: { backgroundColor: '#00459fff', borderColor: '#4e9cff' },
    tabText: { fontSize: 17, color: '#aaa', fontWeight: 'bold', letterSpacing: 1 },
    tabTextActive: { color: '#fff' },
    totalGames: { color: '#fff', fontSize: 16, marginBottom: 18, textAlign: 'center' },
    card: { backgroundColor: '#232427', borderRadius: 16, padding: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.13, shadowRadius: 8, elevation: 4 },
    cardTitle: { fontSize: 19, fontWeight: 'bold', color: '#4e9cff', marginBottom: 10, letterSpacing: 1 },
    playerName: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    statValue: { color: '#fff', fontSize: 15 },
    loading: { marginTop: 50, textAlign: "center", color: '#fff', fontSize: 18 },
});

export default Stats;
