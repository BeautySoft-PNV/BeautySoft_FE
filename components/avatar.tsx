import { View, Image, StyleSheet } from "react-native";
export default function Avatar() {
    return (
        <View style={styles.headerContainer}>
            <Image
                source={{
                    uri: "https://cdn.phamkha.edu.vn/wp-content/uploads/2024/12/makeup-trung-quoc-1.jpg",
                }}
                style={styles.avatar}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        // marginVertical: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 25,
        marginLeft: 10
    },
});





