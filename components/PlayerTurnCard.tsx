import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";

type Player = {
    id: number;
    name: string;
    eliminated: boolean;
    role?: string;
};

type PlayerTurnCardProps = {
    player: Player;
    showCard: boolean;
    setShowCard: (show: boolean) => void;
    selectedWord: { word: string; hint?: string } | null;
    showHint: boolean;
    currentIndex: number;
    players: Player[];
    nextPlayer: () => void;
};

export function PlayerTurnCard({
    player,
    showCard,
    setShowCard,
    selectedWord,
    showHint,
    currentIndex,
    players,
    nextPlayer,
}: PlayerTurnCardProps) {
    const { width } = useWindowDimensions();
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#232427" }}>
            <Text style={{ fontSize: 22, marginBottom: 24, color: "#fff", fontWeight: 'bold', letterSpacing: 1 }}>
                Turno de: <Text style={{ color: '#4e9cff' }}>{player.name}</Text>
            </Text>

            <Pressable
                onPressIn={() => setShowCard(true)}
                onPressOut={() => setShowCard(false)}
                style={{
                    width: 270,
                    height: 170,
                    backgroundColor: showCard ? 'rgba(255, 255, 255, 1)' : '#393b3f',
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 18,
                    borderWidth: 3,
                    borderColor: showCard ? (player.role === "impostor" ? "#ff4e4e" : "#4e9cff") : "#333",
                    shadowColor: '#000',
                    shadowOpacity: 0.18,
                    shadowRadius: 10,
                    marginBottom: 18,
                    elevation: 6,
                }}
            >
                {showCard ? (
                    player.role === "impostor" ? (
                        <View style={{ alignItems: "center" }}>
                            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#ff4e4e", marginBottom: 6 }}>
                                ¡Sos el IMPOSTOR! 😈
                            </Text>
                            {showHint && (
                                <Text style={{ fontSize: 16, marginTop: 8, color: "#4e9cff", textAlign: 'center' }}>
                                    Pista: <Text style={{ color: '#000', fontWeight: 'bold' }}>{selectedWord?.hint}</Text>
                                </Text>
                            )}
                        </View>
                    ) : (
                        <View style={{ alignItems: "center" }}>
                            <Text style={{ fontSize: 26, fontWeight: "bold", color: "#232427" }}>{selectedWord?.word}</Text>
                        </View>
                    )
                ) : (
                    <Text style={{ fontSize: 18, color: "#aaa", textAlign: 'center' }}>
                        {width < 768 ? 'Haz clic para ver tu rol' : 
                        "Mantén presionado para ver tu rol"
                        }
                    </Text>
                )}
            </Pressable>

            {currentIndex < players.length - 1 ? (
                <View style={{ marginTop: 36, width: '100%', alignItems: 'center' }}>
                    <Pressable
                        onPress={nextPlayer}
                        style={{ backgroundColor: '#4e9cff', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6 }}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }}>Siguiente jugador</Text>
                    </Pressable>
                </View>
            ) : (
                <View style={{ marginTop: 36, width: '100%', alignItems: 'center' }}>
                    <Pressable
                        onPress={nextPlayer}
                        style={{ backgroundColor: '#43c96e', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6 }}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }}>Iniciar partida</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}