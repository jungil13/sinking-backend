<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import axios from "axios";
import { io } from "socket.io-client";
import {
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/vue/24/outline";

// ✅ State Management
const isMobile = ref(false);
const isLoadingInbox = ref(true); // Added loading state

const API_BASE = "http://localhost:5000/api/messages";
const SOCKET_URL = "http://localhost:5000";

const inbox = ref([]); // list of conversations
const selectedUser = ref(null);
const messages = ref([]);
const newMessage = ref("");
const staffList = ref([]); // treasurer, screening_committee, admin

const messagesContainer = ref(null);

// Auth
const token = localStorage.getItem("token");
const currentUser = JSON.parse(localStorage.getItem("user")) || {};

// Socket
let socket;

// ✅ Fetchers
const loadInbox = async () => {
  try {
    isLoadingInbox.value = true;
    const { data } = await axios.get(`${API_BASE}/inbox`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    inbox.value = data.map((item) => ({
      id: item.otherUserID,
      username: item.username,
      latestMessage: item.latestMessage,
      unreadCount: item.unreadCount,
    }));
  } catch (err) {
    console.error("Failed to load inbox:", err);
  } finally {
    isLoadingInbox.value = false;
  }
};

const loadStaff = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/staff`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // ✅ Fix: Standardize the staff data to use 'id' instead of 'userID'
    staffList.value = data.map(staff => ({
      id: staff.userID, // Correctly map userID to id
      username: `${staff.firstName} ${staff.lastName}`,
      role: staff.role,
      isStaff: true, // A flag to distinguish staff
    }));
  } catch (err) {
    console.error("Failed to load staff:", err);
  }
};

const loadConversation = async (user) => {
  selectedUser.value = user;

  try {
    const { data } = await axios.get(`${API_BASE}/conversation/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    messages.value = data.map((msg) => ({
      ...msg,
      message: msg.message || "",
    }));

    // ✅ Refactored: Mark all messages as read with a single API call
    if (user.unreadCount > 0) {
      await axios.put(
        `${API_BASE}/mark-as-read/${user.id}`,
        {}, // Empty body for a PUT request
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    }

    // Refresh inbox to clear unread count for the selected conversation
    await loadInbox();

    nextTick(() => {
      scrollToBottom();
    });
  } catch (err) {
    console.error("Failed to load conversation:", err);
  }
};

// ✅ send a new message
const send = async () => {
  if (!newMessage.value.trim() || !selectedUser.value) return;

  console.log("Sending message with payload:", {
    receiverID: selectedUser.value.id,
    message: newMessage.value,
  });

  try {
    const { data } = await axios.post(
      `${API_BASE}`,
      { receiverID: selectedUser.value.id, message: newMessage.value },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    messages.value.push(data);
    newMessage.value = "";
    // ✅ Removed redundant loadInbox() call. The socket event will handle the update.

    nextTick(() => {
      scrollToBottom();
    });
  } catch (err) {
    console.error("Failed to send message:", err);
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// ✅ Lifecycle Hooks
onMounted(() => {
  window.addEventListener("resize", updateIsMobile);
  updateIsMobile();
});

onMounted(async () => {
  await loadInbox();
  await loadStaff();

  socket = io(SOCKET_URL);
  socket.emit("join", currentUser.id);

  socket.on("newMessage", (msg) => {
    // If chatting with the sender, update messages immediately
    if (selectedUser.value && (msg.senderID === selectedUser.value.id || msg.receiverID === selectedUser.value.id)) {
      messages.value.push(msg);
      nextTick(() => {
        scrollToBottom();
      });
    }
    // Otherwise, refresh inbox so unread badge shows
    loadInbox();
  });
});

const updateIsMobile = () => {
  isMobile.value = window.innerWidth < 768;
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] lg:h-[calc(100vh-4rem)]">
      <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-2xl p-4 sm:p-6 text-white shadow-xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <ChatBubbleLeftRightIcon class="w-8 h-8 sm:w-10 sm:h-10 text-blue-200" />
            <div>
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold">Messages</h1>
              <p class="text-blue-100 text-sm sm:text-base">Stay connected with your community</p>
            </div>
          </div>
          <button
            v-if="isMobile && selectedUser"
            @click="selectedUser = null"
            class="md:hidden p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
        </div>
      </div>

      <div
        class="flex flex-col md:flex-row bg-white/90 backdrop-blur-sm rounded-b-2xl shadow-xl overflow-hidden h-[calc(100%-5rem)] sm:h-[calc(100%-6rem)]"
      >
        <aside
          class="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-white/50 backdrop-blur-sm"
          :class="{
            'hidden md:flex': isMobile && selectedUser,
            flex: !isMobile || !selectedUser,
          }"
        >
          <div class="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <h2 class="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ChatBubbleLeftRightIcon class="w-5 h-5 text-white" />
              </div>
              Inbox
            </h2>
            <p class="text-sm text-gray-600 mt-1">{{ inbox.length }} conversation{{ inbox.length !== 1 ? 's' : '' }}</p>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div class="p-4">
              <h3 class="text-gray-700 font-semibold mb-2">Inbox</h3>
              <div v-if="isLoadingInbox" class="text-gray-500 text-center py-4">Loading conversations...</div>
              <ul v-else class="divide-y divide-gray-100">
                <li
                  v-for="u in inbox"
                  :key="u.id"
                  @click="loadConversation(u)"
                  class="flex items-center justify-between p-2 cursor-pointer hover:bg-blue-50/70 transition"
                  :class="{ 'bg-blue-100/80': selectedUser?.id === u.id }"
                >
                  <span class="truncate">{{ u.username }}</span>
                  <span v-if="u.unreadCount > 0" class="text-red-500 font-bold">{{ u.unreadCount }}</span>
                </li>
              </ul>
            </div>

            <div class="p-4 border-t border-gray-200">
              <h3 class="text-gray-700 font-semibold mb-2">Staff</h3>
              <ul class="divide-y divide-gray-100">
                <li
                  v-for="s in staffList"
                  :key="s.id"
                  @click="loadConversation(s)"
                  class="flex items-center justify-between p-2 cursor-pointer hover:bg-green-50/70 transition"
                  :class="{ 'bg-green-100/80': selectedUser?.id === s.id }"
                >
                  <span class="truncate">{{ s.username }} ({{ s.role }})</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        <div
          class="flex flex-1 flex-col relative bg-gradient-to-b from-white to-gray-50 min-h-0"
          :class="{
            'hidden md:flex': isMobile && !selectedUser,
            flex: !isMobile || selectedUser,
          }"
        >
          <div v-if="selectedUser" class="flex-1 flex flex-col min-h-0">
            <div class="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
              <div class="flex items-center gap-3 sm:gap-4 p-4 sm:p-6">
                <button
                  v-if="isMobile"
                  @click="selectedUser = null"
                  class="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
                >
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <div
                  class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg"
                >
                  {{ selectedUser.username?.charAt(0).toUpperCase() || "U" }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-900 truncate text-lg sm:text-xl">{{ selectedUser.username }}</h3>
                  <p class="text-sm text-gray-500">
                    {{ selectedUser.isStaff ? "Staff" : "Active now" }}
                  </p>
                </div>
              </div>
            </div>

            <div
              ref="messagesContainer"
              class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white min-h-0"
              style="max-height: calc(100vh - 300px);"
            >
              <div v-if="!messages.length" class="flex items-center justify-center h-full">
                <div class="text-center">
                  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChatBubbleLeftRightIcon class="w-8 h-8 text-gray-400" />
                  </div>
                  <p class="text-gray-500 text-lg font-medium">No messages yet</p>
                  <p class="text-gray-400 text-sm mt-1">Start the conversation!</p>
                </div>
              </div>

              <div
                v-for="(msg, i) in messages"
                :key="i"
                class="flex animate-fade"
                :class="{
                  'justify-end': msg.senderID === currentUser.id,
                  'justify-start': msg.senderID !== currentUser.id,
                }"
              >
                <div
                  :class="[
                    'px-4 py-3 rounded-2xl max-w-xs sm:max-w-sm lg:max-w-md shadow-lg transition-all duration-200 hover:shadow-xl',
                    msg.senderID === currentUser.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md border border-gray-200',
                  ]"
                >
                  <p class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{{ msg.message }}</p>
                  <div class="flex justify-end mt-1">
                    <span :class="[
                      'text-xs',
                      msg.senderID === currentUser.id ? 'text-blue-100' : 'text-gray-400'
                    ]">
                      {{ new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="sticky bottom-0 bg-white/95 backdrop-blur-sm p-4 sm:p-6 border-t border-gray-200 shadow-lg">
              <div class="flex items-center gap-3 sm:gap-4">
                <input
                  v-model="newMessage"
                  type="text"
                  placeholder="Type your message..."
                  class="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-full border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-sm sm:text-base"
                  @keyup.enter="send"
                />
                <button
                  @click="send"
                  :disabled="!newMessage.trim()"
                  class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white p-3 sm:p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <PaperAirplaneIcon class="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
          </div>

          <div v-else class="flex-1 flex items-center justify-center p-6 sm:p-12">
            <div class="text-center max-w-md">
              <div
                class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <ChatBubbleLeftRightIcon class="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
              </div>
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Welcome to Messages</h3>
              <p class="text-gray-600 text-sm sm:text-base mb-4">Select a conversation from the sidebar to start chatting</p>
              <div class="text-sm text-gray-500">
                <p>💬 Real-time messaging</p>
                <p>📱 Mobile responsive</p>
                <p>🔔 Instant notifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Optional: Better scrollbar styling for desktop */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #38bdf8; /* sky-400 */
  border-radius: 3px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: #e0f2fe; /* sky-50 */
}
</style>
