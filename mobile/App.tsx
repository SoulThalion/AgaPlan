import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-lg font-bold text-blue-600">
        ¡Bienvenido a AgaPlan Mobile!
      </Text>
      <Text className="text-sm text-gray-600 mt-2">
        Aplicación móvil con NativeWind
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
