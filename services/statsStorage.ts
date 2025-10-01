import AsyncStorage from "@react-native-async-storage/async-storage";

export type PlayerStats = {
  username: string;
  gamesPlayed: number;
  impostorCount: number;
  impostorWins: number;
  crewmateWins: number;
};

type GlobalStats = {
  totalGames: number;
  impostorGames: number;
  impostorWins: number;
  impostorWinRate: number;
  crewmateGames: number;
  crewmateWins: number;
  crewmateWinRate: number;
};

export type Update = {
  username: string;
  role: "impostor" | "crewmate";
  won: boolean;
};

const DEFAULT_STATS = (username: string): PlayerStats => ({
  username,
  gamesPlayed: 0,
  impostorCount: 0,
  impostorWins: 0,
  crewmateWins: 0,
});

export const getStats = async (username: string): Promise<PlayerStats> => {
  try {
    const json = await AsyncStorage.getItem(`playerStats`);
    return json ? JSON.parse(json) : DEFAULT_STATS(username);
  } catch (e) {
    console.error("Error leyendo stats", e);
    return DEFAULT_STATS(username);
  }
};

export const updatePlayerStatsBatch = async (updates: Update[]) => {
  console.log("Entra");
  try {
    const raw = await AsyncStorage.getItem("playerStats");
    const allStats: Record<string, any> = raw ? JSON.parse(raw) : {};

    updates.forEach((u) => {
      const name = u.username;
      if (!allStats[name]) {
        allStats[name] = {
          gamesPlayed: 0,
          impostorGames: 0,
          impostorWins: 0,
          crewmateGames: 0,
          crewmateWins: 0,
        };
      }

      const s = allStats[name];
      s.gamesPlayed += 1;
      if (u.role === "impostor") {
        s.impostorGames += 1;
        if (u.won) s.impostorWins += 1;
      } else {
        s.crewmateGames += 1;
        if (u.won) s.crewmateWins += 1;
      }
    });

    await AsyncStorage.setItem("playerStats", JSON.stringify(allStats));
  } catch (err) {
    console.error("updatePlayerStatsBatch error:", err);
  }
};


export const getGlobalStats = async (): Promise<GlobalStats> => {
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

  const totalGames = impostorGames + crewmateGames;

  return {
    totalGames,
    impostorGames,
    impostorWins,
    impostorWinRate: impostorGames > 0 ? (impostorWins / impostorGames) * 100 : 0,
    crewmateGames,
    crewmateWins,
    crewmateWinRate: crewmateGames > 0 ? (crewmateWins / crewmateGames) * 100 : 0,
  };
};

export const updateStats = async (
  username: string,
  role: "impostor" | "crewmate",
  won: boolean
) => {
  try {
    const json = await AsyncStorage.getItem("playerStats");
    const allStats = json ? JSON.parse(json) : {};

    // Si no existe el jugador todavía
    if (!allStats[username]) {
      allStats[username] = {
        gamesPlayed: 0,
        impostorGames: 0,
        impostorWins: 0,
        crewmateGames: 0,
        crewmateWins: 0,
      };
    }

    const stats = allStats[username];

    // Actualizar
    stats.gamesPlayed += 1;
    if (role === "impostor") {
      stats.impostorGames += 1;
      if (won) stats.impostorWins += 1;
    } else {
      stats.crewmateGames += 1;
      if (won) stats.crewmateWins += 1;
    }

    // Guardar todo junto de vuelta
    await AsyncStorage.setItem("playerStats", JSON.stringify(allStats));
  } catch (e) {
    console.error("Error guardando stats:", e);
  }
};
