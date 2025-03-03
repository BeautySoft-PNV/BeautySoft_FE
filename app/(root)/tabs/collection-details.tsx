import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface StyleData {
  id: string; 
  name: string;
  description: string;
  time: string;
  steps: string[];
  image: string;
}

const CollectionDetails = () => {
  const { id } = useLocalSearchParams();
  const [styleData, setStyleData] = useState<StyleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:3000/makeupStyles/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setStyleData(data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleDelete = () => {
    fetch(`http://localhost:3000/makeupStyles/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        router.push('/(root)/(tabs)/collection');
      })
      .catch((err) => console.error(err));
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#ff69b4" style={{ marginTop: 20 }} />;
  }

  if (!styleData) {
    return <Text style={styles.error}>No data found!</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(root)/(tabs)/collection')}>
          <FontAwesome name="chevron-left" size={24} color="#ED1E51" />
        </TouchableOpacity>
        <Text style={styles.mainTitle}>Radiant Beauty Guide</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <FontAwesome name="times" size={24} color="#ED1E51" />
        </TouchableOpacity>
      </View>
      {styleData.image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: styleData.image }} style={styles.image} />
        </View>
      )}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{styleData.name}</Text>
        <View style={styles.timeContainer}>
          <FontAwesome name="calendar" size={14} color="black" />
          <Text style={styles.time}>{styleData.time}</Text>
        </View>
      </View>
      <Text style={styles.description}>{styleData.description}</Text>
      <Text style={styles.subHeading}>Detailed Makeup Instructions:</Text>
      {styleData.steps?.map((step, index) => (
        <Text key={index} style={styles.step}>
          {index + 1}. {step} 
        </Text>
      ))}

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Item Storage</Text>
            <Text style={styles.modalMessage}>Are you sure you want to delete "{styleData.name}"?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>No, Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteText}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 4,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'PlayfairDisplay-Medium',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: 226,
    height: 223,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    fontSize: 23,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    fontFamily: 'PlayfairDisplay-Medium',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  time: {
    color: 'black',
    fontFamily: 'PlayfairDisplay-Medium',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    fontStyle: 'italic',
    fontFamily: 'PlayfairDisplay-Medium',
  },
  subHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'PlayfairDisplay-Medium',
  },
  step: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: 'PlayfairDisplay-Medium',
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'PlayfairDisplay-Medium',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'PlayfairDisplay-Medium',
  },
  modalMessage: {
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'PlayfairDisplay-Medium',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: 'lightgray',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    flex: 1,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ED1E51',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  cancelText: {
    color: 'black',
    fontFamily: 'PlayfairDisplay-Medium',
  },
  deleteText: {
    color: 'white',
    fontFamily: 'PlayfairDisplay-Medium',
  }
});

export default CollectionDetails;