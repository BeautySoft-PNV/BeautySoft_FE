import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from "expo-router";

const Notification = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Item storage",
      text: '"Background A12" has expired in the archive!!!',
      image: 'https://storage.googleapis.com/a1aa/image/clGptheis2bYsjNf3Di8aqdP7gikpOBds97_4-YsWvE.jpg'
    },
    {
      id: 2,
      title: "Item storage",
      text: "Item storage has reached maximum capacity!",
      image: 'https://storage.googleapis.com/a1aa/image/clGptheis2bYsjNf3Di8aqdP7gikpOBds97_4-YsWvE.jpg'
    },
    {
      id: 3,
      title: "Makeup Style Storage",
      text: "Makeup Style Storage has reached maximum capacity!",
      image: 'https://storage.googleapis.com/a1aa/image/clGptheis2bYsjNf3Di8aqdP7gikpOBds97_4-YsWvE.jpg'
    },
    {
      id: 4,
      title: "VNPay Payment Success",
      text: "Your purchase of the unlimited package has been successfully processed via VNPay!",
      image: 'https://storage.googleapis.com/a1aa/image/65s4Q90L7CuPOYVOeR3EHaI-mmY0BkkpP7XMIT-cQ3U.jpg'
    }
  ]);

  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
    setOpenDropdown(null);
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.push('/(root)/(tabs)/home')}>
            <FontAwesome name="chevron-left" size={24} color="#ED1E51" />
          </TouchableOpacity>
          <Text style={styles.header}>Notification</Text>
        </View>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="check-circle" size={50} color="green" />
            <Text style={styles.emptyText}>You have seen all the notifications</Text>
          </View>
        ) : (
          notifications.map((item) => (
            <View key={item.id} style={styles.card}>
              <TouchableOpacity 
                style={styles.menuIcon} 
                onPress={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
              >
                <FontAwesome name="ellipsis-v" size={20} color="white" />
              </TouchableOpacity>
              {openDropdown === item.id && (
                <View style={styles.dropdown}>
                  <TouchableOpacity onPress={() => removeNotification(item.id)}>
                  <Text style={styles.dropdownText}>Remove this notification</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.cardContent}>
                <Image style={styles.icon} source={{ uri: item.image }} />
                <Text style={styles.cardText}>{item.text}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 8,
    marginTop: 20,
  },
  headerContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    width: '100%',
    marginBottom: 40,
  },
  header: {  
    fontSize: 24, 
    fontWeight: 'bold', 
    color: 'black', 
    fontFamily: "PlayfairDisplay-Bold",
    marginRight: 120,
  },
  card: {
    backgroundColor: '#ED1E51',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    padding: 16,
    marginBottom: 20,
    width: '90%',
    position: 'relative',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    fontFamily: 'Playfair Display',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  cardText: {
    color: 'white',
    fontFamily: 'Playfair Display',
    fontSize: 18,
  },
  menuIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  dropdown: {
    position: 'absolute',
    top: -30,
    right: 10,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1, 
    elevation: 5, 
  },  
  dropdownText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 10,
  }
});

export default Notification;
