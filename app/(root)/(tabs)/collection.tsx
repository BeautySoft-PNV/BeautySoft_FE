// import React, { useState } from 'react';
// import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// import { useRouter } from 'expo-router';

// const initialMakeupStyles = [
//   { id: 1, title: 'Cute Eyes Makeup', image: require('@/assets/images/makeupItem1.jpg') },
//   { id: 2, title: 'Asian style', image: require('@/assets/images/makeupItem2.png') },
//   { id: 3, title: 'Glam Night Look', image: require('@/assets/images/makeupItem3.jpg') },
//   { id: 4, title: 'Soft Nude Look', image: require('@/assets/images/makeupItem4.png') },
//   { id: 5, title: 'Dewy Korean Look', image: require('@/assets/images/makeupItem5.png') },
//   { id: 6, title: 'Retro Vintage Look', image: require('@/assets/images/makeupItem6.png') },
// ];
// const Collection = () => {
//   const [makeupStyles, setMakeupStyles] = useState(initialMakeupStyles);
//   const router = useRouter();
//   const handlePress = (style: { id: number }) => {
//     router.push({
//       pathname: '/tabs/collection-details',
//       params: { id: style.id.toString() },
//     });
//   };
//   const handleDelete = (id: number) => {
//   setMakeupStyles(prevStyles => prevStyles.filter(style => style.id !== id));
// };
//   return (
//     <View style={styles.container}>
//     <View style={styles.header}>
//       <Text style={styles.title}>Collection</Text>
//     </View>
//     <ScrollView showsVerticalScrollIndicator={false} style={styles.verticalScroll}>
//       <View style={styles.gridContainer}>
//         {makeupStyles.map((style) => (
//           <TouchableOpacity key={style.id} style={styles.item} onPress={() => handlePress(style)}>
//             <Image source={style.image} style={styles.image} />
//             <Text style={styles.itemTitle}>{style.title}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </ScrollView>
//   </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'white',
//     alignItems: 'center',
//     padding: 16,
//   },
//   header: {
//     alignItems: 'center',
//     paddingVertical: 16,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     fontFamily: 'Playfair Display',
//   },
//   verticalScroll: {
//     backgroundColor: '#ED1E51',
//     borderRadius: 8,
//     padding: 16,
//     width: '100%',
//     marginBottom: 35,
//   },
//   gridContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   item: {
//     width: '48%',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   image: {
//     width: '100%',
//     height: 150,
//     borderRadius: 8,
//   },
//   itemTitle: {
//     color: 'white',
//     marginTop: 8,
//     fontSize: 16,
//     fontWeight: 'bold',
//     fontFamily: 'Playfair Display',
//   },
// });

// export default Collection;



import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface MakeupStyle {
  id: string; 
  name: string;
  description: string;
  time: string;
  steps: string[];
  image: string;
}

const Collection = () => {
  const [makeupStyles, setMakeupStyles] = useState<MakeupStyle[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/makeupStyles'); 
        const data = await response.json();
        if (Array.isArray(data)) {
          setMakeupStyles(data); 
        } else {
          console.error('Invalid data format:', data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handlePress = (style: MakeupStyle) => { 
    router.push({
      pathname: '/tabs/collection-details',
      params: { id: style.id },
    });
  };

  const handleDelete = (id: string) => {
    setMakeupStyles(prevStyles => prevStyles.filter(style => style.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collection</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.verticalScroll}>
        <View style={styles.gridContainer}>
          {makeupStyles.length > 0 ? (
            makeupStyles.map((style) => (
              <TouchableOpacity key={style.id} style={styles.item} onPress={() => handlePress(style)}>
                <Image source={{ uri: style.image }} style={styles.image} /> 
                <Text style={styles.itemTitle}>{style.name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>No makeup styles available.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Playfair Display',
  },
  verticalScroll: {
    backgroundColor: '#ED1E51',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 35,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  itemTitle: {
    color: 'white',
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Playfair Display',
  },
  noDataText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Collection;