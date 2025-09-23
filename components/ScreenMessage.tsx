import React from "react";
import { Text, View } from "react-native";

export type MessageType = "success" | "error";

interface ScreenMessageProps {
  message: string;
  type: MessageType;
}

export const ScreenMessage: React.FC<ScreenMessageProps> = ({ message, type }) => {
  const backgroundColor = type === "success" ? "#43c96e" : "#ff4e4e";
  return (
    <View
      style={{
        backgroundColor,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 10,
        marginVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 6,
        minWidth: 180,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16, textAlign: 'center' }}>{message}</Text>
    </View>
  );
};
