import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Alert } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

interface Insect {
  id: number;
  x: number;
  y: number;
  type: 'mosca' | 'araña' | 'mariposa';
  points: number;
}

interface GameState {
  score: number;
  timeLeft: number;
  isPlaying: boolean;
  insects: Insect[];
  gameOver: boolean;
}

export const GameScreen = () => {
  const navigation = useNavigation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: 30,
    isPlaying: false,
    insects: [],
    gameOver: false
  });

  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const gameInterval = useRef<NodeJS.Timeout | null>(null);
  const insectInterval = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);

  const insectColors = {
    mosca: '#8B4513',
    araña: '#2F4F4F',
    mariposa: '#FF69B4'
  };

  const insectPoints = {
    mosca: 10,
    araña: 20,
    mariposa: 30
  };

  const generateRandomPosition = () => {
    const margin = 50;
    return {
      x: Math.random() * (width - margin * 2) + margin,
      y: Math.random() * (height - margin * 2) + margin
    };
  };

  const generateInsect = (): Insect => {
    const types: ('mosca' | 'araña' | 'mariposa')[] = ['mosca', 'araña', 'mariposa'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const position = generateRandomPosition();
    return {
      id: Date.now() + Math.random(),
      x: position.x,
      y: position.y,
      type: randomType,
      points: insectPoints[randomType]
    };
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      timeLeft: 30,
      isPlaying: true,
      insects: [],
      gameOver: false
    }));

    gameInterval.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          endGame();
          return { ...prev, timeLeft: 0, isPlaying: false, gameOver: true };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    insectInterval.current = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        insects: [...prev.insects, generateInsect()]
      }));
    }, 2000);
  };

  const endGame = async () => {
    if (gameInterval.current) clearInterval(gameInterval.current);
    if (insectInterval.current) clearInterval(insectInterval.current);

    if (auth.currentUser && scoreRef.current > 0) {
      try {
        const scoresRef = collection(db, 'scores');
        await addDoc(scoresRef, {
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email,
          score: scoreRef.current,
          timestamp: serverTimestamp(),
        });
        setScoreSaved(true);
      } catch (error) {
        setScoreSaved(false);
        Alert.alert(
          'Error al guardar',
          'No se pudo guardar tu puntuación. Verifica tu conexión a internet.',
          [{ text: 'OK' }]
        );
      }
    } else {
      setScoreSaved(false);
    }
    setShowGameOverDialog(true);
  };

  const catchInsect = (insectId: number) => {
    setGameState(prev => {
      const insect = prev.insects.find(i => i.id === insectId);
      if (!insect) return prev;
      const newScore = prev.score + insect.points;
      return {
        ...prev,
        score: newScore,
        insects: prev.insects.filter(i => i.id !== insectId)
      };
    });
  };

  const restartGame = () => {
    setShowGameOverDialog(false);
    setScoreSaved(false);
    setGameState(prev => ({
      ...prev,
      score: 0,
      timeLeft: 30,
      isPlaying: false,
      insects: [],
      gameOver: false
    }));
  };

  useEffect(() => {
    return () => {
      if (gameInterval.current) clearInterval(gameInterval.current);
      if (insectInterval.current) clearInterval(insectInterval.current);
    };
  }, []);

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        insects: prev.insects.filter(insect => 
          Date.now() - insect.id < 5000
        )
      }));
    }, 1000);
    return () => clearInterval(cleanupInterval);
  }, []);

  useEffect(() => {
    scoreRef.current = gameState.score;
  }, [gameState.score]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Caza Insectos</Text>
        <View style={styles.gameInfo}>
          <Text style={styles.scoreText}>Puntuación: {gameState.score}</Text>
          <Text style={styles.timeText}>Tiempo: {gameState.timeLeft}s</Text>
        </View>
      </View>
      <View style={styles.gameArea}>
        {!gameState.isPlaying && !gameState.gameOver && (
          <View style={styles.startContainer}>
            <Text style={styles.startTitle}>¡Caza Insectos!</Text>
            <Text style={styles.startInstructions}>
              Toca los insectos para ganar puntos{'\n'}
              Mosca: 10 pts | Araña: 20 pts | Mariposa: 30 pts{'\n'}
              ¡Tienes 30 segundos!
            </Text>
            <Button 
              mode="contained" 
              onPress={startGame}
              style={styles.startButton}
            >
              ¡Comenzar Juego!
            </Button>
          </View>
        )}
        {gameState.insects.map(insect => (
          <TouchableOpacity
            key={insect.id}
            style={[
              styles.insect,
              {
                left: insect.x,
                top: insect.y,
                backgroundColor: insectColors[insect.type]
              }
            ]}
            onPress={() => catchInsect(insect.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.insectText}>
              {insect.type === 'mosca' ? '🪰' : 
               insect.type === 'araña' ? '🕷️' : '🦋'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Portal>
        <Dialog visible={showGameOverDialog} dismissable={false}>
          <Dialog.Title>¡Juego Terminado!</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.gameOverText}>Puntuación Final: {gameState.score} puntos</Text>
            <Text style={styles.gameOverText}>{scoreSaved ? '✅ Puntuación guardada exitosamente' : '⚠️ No se pudo guardar la puntuación'}</Text>
            <Text style={styles.gameOverText}>¡Excelente trabajo!</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={restartGame}>Jugar de Nuevo</Button>
            <Button onPress={() => {
              setShowGameOverDialog(false);
              setScoreSaved(false);
              navigation.navigate('ScoresTab' as never);
            }}>
              Ver Puntuaciones
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#90EE90',
  },
  header: {
    backgroundColor: '#228B22',
    padding: 20,
    paddingTop: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 20,
  },
  startInstructions: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  startButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  insect: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  insectText: {
    fontSize: 24,
  },
  gameOverText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
}); 