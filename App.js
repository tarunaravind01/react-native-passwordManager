import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, TextInput, Button, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Clipboard from 'expo-clipboard';

const generateRandomPassword = (length = 12) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

const App = () => {
  const [input, setInput] = useState({ username: '', password: '', website: '' });
  const [websites, setWebsites] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    const storedWebsitesString = await SecureStore.getItemAsync('websites');
    const storedWebsites = storedWebsitesString ? JSON.parse(storedWebsitesString) : [];
    setWebsites(storedWebsites);
  };

  const storeCredentials = async () => {
    const { username, password, website } = input;
    const credentials = JSON.stringify({ username, password });
    await SecureStore.setItemAsync(website, credentials);
    Alert.alert('Success', 'Credentials saved successfully!');

    const updatedWebsites = [...new Set([...websites, website])];
    await SecureStore.setItemAsync('websites', JSON.stringify(updatedWebsites));
    setWebsites(updatedWebsites);
    setShowForm(false); // Hide the form after saving
    setInput({ username: '', password: '', website: '' }); // Reset form
  };

  const retrieveAndCopyCredentials = async (website) => {
    const credentialsString = await SecureStore.getItemAsync(website);
    if (credentialsString) {
      const { username, password } = JSON.parse(credentialsString);
      Clipboard.setStringAsync(`Username: ${username}, Password: ${password}`);
      Alert.alert('Copied', 'Credentials copied to clipboard!');
    }
  };

  const deleteCredentials = async (website) => {
    await SecureStore.deleteItemAsync(website);
    Alert.alert('Deleted', 'Credentials deleted successfully!');
    const updatedWebsites = websites.filter(w => w !== website);
    await SecureStore.setItemAsync('websites', JSON.stringify(updatedWebsites));
    setWebsites(updatedWebsites);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Button title={showForm ? "Hide Form" : "Add Credentials"} onPress={() => setShowForm(!showForm)} />
        {showForm && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setInput({ ...input, username: text })}
              value={input.username}
              placeholder="Username"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                onChangeText={(text) => setInput({ ...input, password: text })}
                value={input.password}
                placeholder="Password"
                secureTextEntry={true}
              />
              <Button title="Generate" onPress={() => setInput({ ...input, password: generateRandomPassword() })} />
            </View>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setInput({ ...input, website: text })}
              value={input.website}
              placeholder="Website"
            />
            <Button title="Save Credentials" onPress={storeCredentials} />
          </View>
        )}
        {websites.map((website, index) => (
          <View key={index} style={styles.websiteTile}>
            <Text style={styles.tileText}>{website}</Text>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.tileButton} onPress={() => retrieveAndCopyCredentials(website)}>
                <Text style={styles.tileButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tileButton} onPress={() => deleteCredentials(website)}>
                <Text style={styles.tileButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    flex: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    marginRight: 10,
  },
  websitesContainer: {
    marginTop: 20,
  },
  websiteTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e0e0e0',
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
  },
  tileText: {
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  tileButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 5,
    padding: 10,
    borderRadius: 5,
  },
  tileButtonText: {
    color: '#fff',
  },
});

export default App;
