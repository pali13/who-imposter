import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { ScreenMessage } from "./ScreenMessage";
import { updatePlayerStatsBatch, Update } from "@/services/statsStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Player = {
    id: number;
    name: string;
    eliminated: boolean;
    role?: "impostor" | "normal";
};

type Props = {
    initialPlayers: Player[];
    setNewGame: () => void;
};

export default function RoundScreen({ initialPlayers, setNewGame }: Props) {
    const [players, setPlayers] = useState<Player[]>(initialPlayers);
    const [numberPlayers, setNumberPlayers] = useState(initialPlayers.length);
    const [round, setRound] = useState(1);
    const [winners, setWinners] = useState<Player[]>([])
    const [losers, setLoser] = useState<Player[]>([])
    const [isEnd, setIsEnd] = useState(false);

    useEffect(() => {
        if (players.filter(p => p.role === "normal" && !p.eliminated).length === 1) {
            endGame()
        }
        if (players.filter(p => p.role === "impostor" && !p.eliminated).length === 0) {
            endGame()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [players]);


    const imposters = initialPlayers.filter(p => p.role === "impostor")

    const eliminatePlayer = (id: number) => {
        setPlayers((prev) =>
            prev.map((p) => (p.id === id ? { ...p, eliminated: true } : p))
        );
        nextRound()
    };

    const nextRound = () => {
        setRound((r) => r + 1);
        setNumberPlayers(numberPlayers - 1);
        checkStates()
    };

    const checkStates = () => {
        if (players.filter(p => p.role === "normal" && !p.eliminated).length === 1) {
            endGame()
        }
        if (imposters.filter(p => !p.eliminated).length === 0) {
            endGame()
        }
    }

    const endGame = async () => {
        const playersInGame = players.filter(p => !p.eliminated);
        const impostoresDelete = players.filter(p => p.role === "impostor" && p.eliminated);

        const updates: Update[] = [];

        if (playersInGame.filter(p => p.role === "impostor").length > 0) {
            const winners = playersInGame.filter(p => p.role === "impostor");
            setWinners(winners);

            winners.forEach(w => {
                updates.push({ username: w.name, role: "impostor", won: true })
            });
            const crewmatesLosers = players.filter(p => p.role === "normal");
            crewmatesLosers.forEach(l => {
                updates.push({ username: l.name, role: "crewmate", won: false })
            });

            if (impostoresDelete.length > 0) {
                setLoser(impostoresDelete);
                impostoresDelete.forEach(l => {
                    updates.push({ username: l.name, role: "impostor", won: false })
                }
                );
            }
        } else {
            setLoser(impostoresDelete);
            impostoresDelete.forEach(l => {
                updates.push({ username: l.name, role: "impostor", won: false })
            });
            const winners = playersInGame.filter(p => p.role === "normal");
            setWinners(winners);
            winners.forEach(w => {
                updates.push({ username: w.name, role: "crewmate", won: true })
            });
        }

        const json = await AsyncStorage.getItem("globalStats");
        const globalStats = json ? JSON.parse(json) : { totalGames: 0 };
        globalStats.totalGames += 1;
        await AsyncStorage.setItem("totalGames", JSON.stringify(globalStats.totalGames));

        await updatePlayerStatsBatch(updates);
        setIsEnd(true)
    }

    return (
        <View
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                backgroundColor: "#232427",
            }}
        >
            <Text
                style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    marginBottom: 18,
                    color: "#fff",
                    letterSpacing: 1,
                }}
            >
                Ronda {round}
            </Text>
            {winners.length > 0 && (
                <ScreenMessage
                    type="success"
                    message={`Ganó: ${winners.map(w => w.name).join(", ")}`}
                />
            )
            }
            {losers.length > 0 && (
                <ScreenMessage
                    type="success"
                    message={`Perdió: ${losers.map(w => w.name).join(", ")}`}
                />
            )}
            <Text
                style={{
                    fontSize: 18,
                    marginBottom: 24,
                    color: "#ccc",
                }}
            >
                Jugadores restantes: {numberPlayers}
            </Text>
            {winners.length === 0 && (
                <View
                    style={{
                        width: "100%",
                        backgroundColor: "#393b3f",
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 24,
                        shadowColor: "#000",
                        shadowOpacity: 0.1,
                        shadowRadius: 6,
                    }}
                >
                    <FlatList
                        data={players}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 10,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 20,
                                        color: item.eliminated ? "#888" : "#fff",
                                        textDecorationLine: item.eliminated ? "line-through" : "none",
                                        fontStyle: item.eliminated ? "italic" : "normal",
                                        flex: 1,
                                    }}
                                >
                                    {item.name}
                                </Text>
                                {!item.eliminated && (
                                    <TouchableOpacity
                                        onPress={() => eliminatePlayer(item.id)}
                                        style={{
                                            marginLeft: 12,
                                            padding: 6,
                                            borderRadius: 8,
                                            backgroundColor: "#ff4e4e",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: "#fff",
                                                fontWeight: "bold",
                                                fontSize: 18,
                                            }}
                                        >
                                            ❌
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    />
                </View>
            )}
            {isEnd && (
                <View>
                    <TouchableOpacity
                        onPress={nextRound}
                        style={{
                            width: "100%",
                            backgroundColor: "#00991c",
                            paddingVertical: 14,
                            paddingHorizontal: 40,
                            borderRadius: 12,
                            shadowColor: "#000",
                            shadowOpacity: 0.15,
                            shadowRadius: 6,
                        }}
                    >
                        <Text
                            style={{
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: 18,
                                letterSpacing: 1,
                                margin: 'auto',
                            }}
                        >
                            Siguiente Ronda
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={endGame}
                        style={{
                            width: "100%",
                            marginTop: 12,
                            backgroundColor: "#ab0921",
                            paddingVertical: 14,
                            paddingHorizontal: 40,
                            borderRadius: 12,
                            shadowColor: "#000",
                            shadowOpacity: 0.15,
                            shadowRadius: 6,
                        }}
                    >
                        <Text
                            style={{
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: 18,
                                letterSpacing: 1,
                                margin: 'auto',

                            }}
                        >
                            Fin del juego
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            <TouchableOpacity
                onPress={setNewGame}
                style={{
                    width: "100%",
                    marginTop: 12,
                    backgroundColor: "#4e9cff",
                    paddingVertical: 14,
                    paddingHorizontal: 40,
                    borderRadius: 12,
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                }}
            >
                <Text
                    style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 18,
                        letterSpacing: 1,
                        margin: 'auto',
                    }}
                >
                    Volver a empezar
                </Text>
            </TouchableOpacity>
        </View>
    );
}
