import RoundScreen from "@/components/RoundScreen";
import React, { useState } from "react";
import { Button, Image, Pressable, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import words from "../../constants/words.json";
import { PlayerTurnCard } from "@/components/PlayerTurnCard";

type Player = {
  id: number;
  name: string;
  eliminated: boolean;
  role?: "impostor" | "normal";
};

type Word = {
  word: string;
  hint: string;
  category: string;
};

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [impostors, setImpostors] = useState(1);
  const [showHint, setShowHint] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [startRound, setStartRound] = useState(false);
  const [showRound, setShowRound] = useState(false);

  const newGame = () => {
    setShowHint(false);
    setGameStarted(false);
    setCurrentIndex(0);
    setShowCard(false);
    setSelectedWord(null);
    setStartRound(false);
    setShowRound(false);
  }

  // Iniciar juego
  const startGame = () => {

    if (players.length < 3) {
      alert("Debe haber al menos 3 jugadores.");
      return;
    }

    if (impostors < 1) {
      alert("Debe haber al menos un impostor.");
      return;
    }

    if (impostors >= players.length / 2) {
      alert("El número de impostores debe ser menor que la mitad del número de jugadores.");
      return;
    }
    const randomWord = getRandomWord();
    setSelectedWord(randomWord);
    // clonar array
    let updated = [...players];

    // elegir impostores aleatorios
    let impostorIds: number[] = [];
    while (impostorIds.length < impostors) {
      const random = Math.floor(Math.random() * updated.length);
      if (!impostorIds.includes(updated[random].id)) {
        impostorIds.push(updated[random].id);
      }
    }

    updated = updated.map((p) =>
      impostorIds.includes(p.id)
        ? { ...p, role: "impostor" }
        : { ...p, role: "normal" }
    );

    setPlayers(updated);
    setGameStarted(true);
    setCurrentIndex(0);
  };

  const nextPlayer = () => {
    if (currentIndex < players.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowCard(false);
    } else {
      setStartRound(true);
      setShowRound(true);
    }
  };

  // Categorías disponibles
  const categories = [...new Set(words.map(item => item.category))];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([categories[0]]);



  const addPlayer = () => {
    if (playerName.trim() === "") return;
    setPlayers([...players, { id: players.length + 1, name: playerName, eliminated: false }]);
    setPlayerName("");
  };

  const deletePlayer = (id: number) => {
    setPlayers(players.filter(p => p.id !== id));
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };
  const selectAllCategories = () => setSelectedCategories([...categories]);
  const clearAllCategories = () => setSelectedCategories([]);

  // Obtener una palabra aleatoria
  const getRandomWord = (): Word => {
    const filteredWords = words.filter(w => selectedCategories.includes(w.category));
    const index = Math.floor(Math.random() * filteredWords.length);
    return filteredWords[index];
  };

  if (!gameStarted) {
    return (
      <ScrollView style={{ padding: 20, marginTop: 40, width: "100%", backgroundColor: "#393b3f", margin: "auto", borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 10, color: "#fff", textAlign: 'center', letterSpacing: 1 }}>
          Configuración de la Sala
        </Text>
        {/* Imagen debajo del título */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Image source={require('../../assets/images/logo.png')} style={{ width: 250, height: 250, borderRadius: 20, marginBottom: 10 }} />
        </View>
        {/* Lista de jugadores */}
        <View style={{ backgroundColor: '#232427', borderRadius: 12, padding: 16, marginBottom: 18 }}>
          <Text style={{ fontSize: 18, color: "#fff", marginBottom: 6 }}>Jugadores:</Text>
          {players.length === 0 ? (
            <Text style={{ color: '#aaa', fontStyle: 'italic' }}>Agrega jugadores para comenzar</Text>
          ) : (
            players.map((p) => (
              <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text key={p.id} style={{ color: '#fff', marginLeft: 8, marginRight: 8 }}>- {p.name}</Text>
                <Pressable onPress={() => deletePlayer(p.id)}> <Text style={{color: 'red'}}>X </Text> </Pressable>
              </View>
            ))
          )}
          <TextInput
            placeholder="Nombre del jugador"
            placeholderTextColor="#aaa"
            value={playerName}
            onChangeText={setPlayerName}
            style={{
              borderWidth: 1,
              borderColor: "#555",
              backgroundColor: '#18191b',
              padding: 10,
              marginTop: 12,
              borderRadius: 8,
              color: "#fff",
              marginBottom: 8
            }}
          />
          <Button title="Agregar jugador" onPress={addPlayer} color="#4e9cff" />
        </View>
        {/* Cantidad de impostores */}
        <View style={{ backgroundColor: '#232427', borderRadius: 12, padding: 16, marginBottom: 18 }}>
          <Text style={{ fontSize: 18, color: "#fff" }}>Cantidad de impostores:</Text>
          <TextInput
            placeholder="Ej: 1"
            placeholderTextColor="#aaa"
            value={impostors.toString()}
            onChangeText={(v) => setImpostors(Number(v))}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: "#555",
              backgroundColor: '#18191b',
              padding: 10,
              marginTop: 12,
              borderRadius: 8,
              color: "#fff"
            }}
          />
        </View>
        {/* Categoría */}
        <View style={{ backgroundColor: '#232427', borderRadius: 12, padding: 16, marginBottom: 18 }}>
          <Text style={{ fontSize: 18, color: "#fff", marginBottom: 10 }}>Categorías:</Text>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => toggleCategory(cat)}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
            >
              <View style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: selectedCategories.includes(cat) ? '#4e9cff' : '#555',
                backgroundColor: selectedCategories.includes(cat) ? '#4e9cff' : 'transparent',
                marginRight: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {selectedCategories.includes(cat) && (
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>✓</Text>
                )}
              </View>
              <Text style={{ color: '#fff', fontSize: 16 }}>{cat}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Button title="Seleccionar todas" onPress={selectAllCategories} color="#4e9cff" />
            <Button title="Borrar todas" onPress={clearAllCategories} color="#ff4e4e" />
          </View>
        </View>
        {/* Mostrar pista */}
        <View style={{ backgroundColor: '#232427', borderRadius: 12, padding: 16, marginBottom: 18, flexDirection: "row", alignItems: "center", justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 18, color: "#fff" }}>¿Mostrar pista?</Text>
          <Switch value={showHint} onValueChange={setShowHint} />
        </View>
        {/* Botón para iniciar */}
        <View style={{ marginTop: 10, marginBottom: 20 }}>
          <Button title="Iniciar juego" onPress={startGame} color="#4e9cff" />
        </View>
      </ScrollView>
    );

  }

  if (!startRound) {
    // Pantalla de tarjetas
    const player = players[currentIndex];

    return (
      <PlayerTurnCard
        player={player}
        showCard={showCard}
        setShowCard={setShowCard}
        selectedWord={selectedWord}
        showHint={showHint}
        currentIndex={currentIndex}
        players={players}
        nextPlayer={nextPlayer}
      />
    );
  }

  if (showRound) {
  } return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <RoundScreen initialPlayers={players} setNewGame={newGame} />
    </View>
  );
}