import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppNavigator';

export const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleRegister = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please enter all fields');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Already have an account? <Text style={styles.linkActionText}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center', color: '#1a1a1a' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 16, borderRadius: 12, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#FF6B6B', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkContainer: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#666', fontSize: 14 },
  linkActionText: { color: '#007AFF', fontWeight: 'bold', textDecorationLine: 'underline' }
});
