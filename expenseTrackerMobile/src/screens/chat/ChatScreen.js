import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, DEFAULT_PROFILE_IMAGE, WS_BASE_URL } from '../../config/constants';
import { Client } from '@stomp/stompjs';
import { TextEncoder, TextDecoder } from 'text-encoding';

// Polyfill for STOMP in React Native
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}
if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}

const ChatScreen = ({ route, navigation }) => {
  const { friendId, friendName, friendImage } = route.params;
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const flatListRef = useRef(null);
  const stompClient = useRef(null);
  const subscriptionRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: friendImage || DEFAULT_PROFILE_IMAGE }}
            style={{ width: 35, height: 35, borderRadius: 17.5, marginRight: 10 }}
          />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.white }}>
            {friendName}
          </Text>
        </View>
      ),
    });
    initializeChat();

    return () => {
      console.log('🧹 Cleaning up chat screen');
      disconnectWebSocket();
    };
  }, [friendId]);

  useEffect(() => {
    if (conversationId && token) {
      console.log('🔌 Conditions met for WebSocket connection');
      connectWebSocket();
    }
  }, [conversationId, token]);

  const connectWebSocket = () => {
    if (!token || !conversationId) {
      console.warn('⚠️ Missing token or conversationId, cannot connect WebSocket');
      return;
    }

    disconnectWebSocket(); // Clean up existing connection if any

    // Construct WebSocket URL with token as query parameter
    const wsUrl = `${WS_BASE_URL}?token=${encodeURIComponent(token)}`;
    console.log('🔗 Attempting WebSocket connection to:', wsUrl.replace(token, '***'));

    const client = new Client({
      brokerURL: wsUrl,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectionTimeout: 10000,
      debug: (str) => {
        console.log('[STOMP Debug]:', str);
      },
      onConnect: (frame) => {
        console.log('✅ STOMP: Connected successfully!', frame);
        setWsConnected(true);
        reconnectAttempts.current = 0;

        // Subscribe to conversation topic
        const topic = `/topic/conversation/${conversationId}`;
        console.log('📡 Subscribing to topic:', topic);
        
        try {
          subscriptionRef.current = client.subscribe(
            topic,
            (message) => {
              console.log('📨 STOMP: Message Received:', message.body);
              try {
                const newMessage = JSON.parse(message.body);
                
                setMessages((prev) => {
                  // Check if message already exists
                  if (prev.find((msg) => msg.id === newMessage.id)) {
                    console.log('⏭️ Duplicate message ignored:', newMessage.id);
                    return prev;
                  }
                  
                  // Remove optimistic message
                  const filtered = prev.filter(msg => 
                    !(msg.isOptimistic && 
                      msg.content?.trim() === newMessage.content?.trim() && 
                      msg.senderId == newMessage.senderId)
                  );
                  
                  console.log('✅ Adding new message to state:', newMessage.id);
                  return [...filtered, newMessage];
                });
              } catch (parseError) {
                console.error('❌ Error parsing message:', parseError);
              }
            },
            { id: `conversation-${conversationId}` }
          );
          console.log('✅ Successfully subscribed to topic');
        } catch (subError) {
          console.error('❌ Error subscribing to topic:', subError);
        }
      },
      onStompError: (frame) => {
        console.error('❌ STOMP Error Frame:', frame);
        console.error('Error message:', frame.headers['message']);
        console.error('Error body:', frame.body);
        setWsConnected(false);
      },
      onWebSocketError: (event) => {
        console.error('❌ WebSocket Error Event:', event);
        setWsConnected(false);
      },
      onWebSocketClose: (event) => {
        console.log('🔌 WebSocket Closed:', event.code, event.reason);
        setWsConnected(false);
      },
      onDisconnect: () => {
        console.log('🔌 STOMP: Disconnected');
        setWsConnected(false);
      },
      beforeConnect: () => {
        console.log('🔄 STOMP: Attempting to connect...');
        reconnectAttempts.current += 1;
        
        if (reconnectAttempts.current > maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached');
          Alert.alert(
            'Connection Error',
            'Unable to establish real-time chat connection. Messages will still be delivered.',
            [{ text: 'OK' }]
          );
          return false; // Stop reconnection attempts
        }
        return true;
      }
    });

    try {
      client.activate();
      stompClient.current = client;
      console.log('🚀 STOMP client activated');
    } catch (activationError) {
      console.error('❌ Error activating STOMP client:', activationError);
    }
  };

  const disconnectWebSocket = () => {
    console.log('🔌 Disconnecting WebSocket...');
    
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
        console.log('✅ Unsubscribed from topic');
      } catch (err) {
        console.error('Error unsubscribing:', err);
      }
      subscriptionRef.current = null;
    }
    
    if (stompClient.current) {
      try {
        stompClient.current.deactivate();
        console.log('✅ STOMP client deactivated');
      } catch (err) {
        console.error('Error deactivating client:', err);
      }
      stompClient.current = null;
    }
    
    setWsConnected(false);
  };

  const initializeChat = async () => {
    try {
      console.log('🔧 Initializing chat with friend:', friendId);
      
      // Get or create conversation
      const convResponse = await chatAPI.getConversationId(friendId);
      const convId = convResponse.data;
      console.log('✅ Got conversation ID:', convId);
      setConversationId(convId);

      // Load message history
      const historyResponse = await chatAPI.getChatHistory(convId);
      const chatHistory = historyResponse.data || [];
      console.log('✅ Loaded chat history:', chatHistory.length, 'messages');

      setMessages(chatHistory);
    } catch (error) {
      console.error('❌ Error initializing chat:', error);
      console.error('Error details:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    // Create optimistic message
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content: messageText,
      senderId: user.id,
      timestamp: new Date().toISOString(),
      isOptimistic: true,
    };

    // Add to UI immediately
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      console.log('📤 Sending message:', { conversationId, receiverId: friendId });
      
      await chatAPI.sendMessage({
        conversationId,
        receiverId: friendId,
        content: messageText,
      });
      
      console.log('✅ Message sent successfully');
      
      // If WebSocket is not connected, manually fetch the latest message
      if (!wsConnected) {
        console.log('⚠️ WebSocket not connected, fetching message manually');
        setTimeout(async () => {
          try {
            const historyResponse = await chatAPI.getChatHistory(conversationId);
            const chatHistory = historyResponse.data || [];
            setMessages(chatHistory);
          } catch (fetchError) {
            console.error('Error fetching updated messages:', fetchError);
          }
        }, 500);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === user.id;
    const senderImage = isMyMessage ? user.imageUrl : friendImage;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        {!isMyMessage && (
          <View style={{ width: 0 }} />
        )}
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
            item.isOptimistic && styles.optimisticBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.content}
          </Text>
        </View>
        {isMyMessage && (
          <View style={{ width: 0 }} />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Connection status indicator */}
      {!wsConnected && (
        <View style={styles.connectionBanner}>
          <Ionicons name="warning-outline" size={16} color={COLORS.warning} />
          <Text style={styles.connectionText}>
            Reconnecting to real-time chat...
          </Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id?.toString() || `msg-${item.timestamp}`}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.gray}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons name="send" size={20} color={COLORS.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
  },
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3CD',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE69C',
  },
  connectionText: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 6,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  theirMessageContainer: {
    justifyContent: 'flex-start',
  },

  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optimisticBubble: {
    opacity: 0.7,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: COLORS.white,
  },
  theirMessageText: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  theirTimestamp: {
    color: COLORS.gray,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    fontSize: 15,
    color: COLORS.text,
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
});

export default ChatScreen;