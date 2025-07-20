import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebaseConfig';
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

interface Score {
  id: string;
  userId: string;
  userEmail: string;
  score: number;
  timestamp: any;
  rank?: number;
}

export const ScoreScreen = () => {
  const navigation = useNavigation();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userBestScore, setUserBestScore] = useState<number>(0);

  // Cargar puntuaciones desde Firestore
  const loadScores = async () => {
    try {
      setLoading(true);
      const scoresRef = collection(db, 'scores');
      const q = query(scoresRef, orderBy('score', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const scoresData: Score[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        scoresData.push({
          id: doc.id,
          userId: data.userId,
          userEmail: data.userEmail,
          score: data.score,
          timestamp: data.timestamp,
        });
      });
      const scoresWithRank = scoresData.map((score, index) => ({
        ...score,
        rank: index + 1
      }));
      setScores(scoresWithRank);
      if (auth.currentUser) {
        const userScoreIndex = scoresWithRank.findIndex(
          score => score.userId === auth.currentUser!.uid
        );
        if (userScoreIndex !== -1) {
          setUserRank(userScoreIndex + 1);
          setUserBestScore(scoresWithRank[userScoreIndex].score);
        }
      }
    } catch (error) {
      // Error silenciado para producción
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para guardar una nueva puntuación
  const saveScore = async (score: number) => {
    if (!auth.currentUser) return;
    try {
      const scoresRef = collection(db, 'scores');
      await addDoc(scoresRef, {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        score: score,
        timestamp: serverTimestamp(),
      });
      loadScores();
    } catch (error) {
      // Error silenciado para producción
    }
  };

  // Función para refrescar
  const onRefresh = () => {
    setRefreshing(true);
    loadScores();
  };

  // Cargar puntuaciones al montar el componente
  useEffect(() => {
    loadScores();
  }, []);

  // Función para formatear fecha
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Fecha no disponible';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener el color del ranking
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Oro
      case 2: return '#C0C0C0'; // Plata
      case 3: return '#CD7F32'; // Bronce
      default: return '#666';
    }
  };

  // Renderizar cada puntuación
  const renderScoreItem = ({ item, index }: { item: Score; index: number }) => (
    <Card style={[
      styles.scoreCard,
      item.userId === auth.currentUser?.uid && styles.userScoreCard
    ]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.rankContainer}>
          <Text style={[
            styles.rankText,
            { color: getRankColor(item.rank || 0) }
          ]}>
            #{item.rank}
          </Text>
        </View>
        
        <View style={styles.scoreInfo}>
          <Title style={styles.userEmail}>
            {item.userEmail}
          </Title>
          <Paragraph style={styles.scoreText}>
            {item.score} puntos
          </Paragraph>
          <Paragraph style={styles.dateText}>
            {formatDate(item.timestamp)}
          </Paragraph>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Cargando puntuaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Leaderboard Global</Text>
        {userRank && (
          <View style={styles.userStats}>
            <Text style={styles.userStatsText}>
              Tu ranking: #{userRank} | Mejor puntuación: {userBestScore}
            </Text>
          </View>
        )}
      </View>

      {/* Lista de puntuaciones */}
      <FlatList
        data={scores}
        renderItem={renderScoreItem}
        keyExtractor={(item) => item.id}
        style={styles.scoreList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6200ee']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay puntuaciones aún.{'\n'}
              ¡Sé el primero en jugar!
            </Text>
          </View>
        }
      />

      {/* FAB para volver al juego */}
      <FAB
        style={styles.fab}
        icon="gamepad-variant"
        onPress={() => navigation.navigate('GameTab' as never)}
        label="Jugar"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  userStats: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  userStatsText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  scoreList: {
    flex: 1,
    padding: 10,
  },
  scoreCard: {
    marginBottom: 10,
    elevation: 3,
  },
  userScoreCard: {
    borderWidth: 2,
    borderColor: '#6200ee',
    backgroundColor: '#f3e5f5',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
}); 