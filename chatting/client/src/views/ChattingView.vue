<template>
	<div>
		<ul>
			<template v-for="userInfo of state.userList" :key="userInfo.id">
				<li v-if="userInfo.username === state.username">
					{{ userInfo.username }}
				</li>
				<li v-else>
					<a href="javascript:;" @click="selectUser(userInfo)">
						{{ userInfo.username }}
					</a>
				</li>
			</template>
		</ul>

		<div v-if="state.targetUser">
			<h3>{{ state.targetUser.username }}</h3>
			<input type="text" placeholder="Input some..." v-model="state.msgText" />
			<button @click="sendMessage">Send</button>
		</div>

		<div>
			<ul>
				<li v-for="(data, index) of messageList" :key="index">
					<p>{{ data.fromUsername }}:{{ new Date(data.dateTime) }}</p>
					<p>{{ data.msg }}</p>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup>
import { io } from 'socket.io-client'
import { useRouter } from 'vue-router'
import { reactive, computed } from 'vue'

const router = useRouter()
const state = reactive({
	username: router.currentRoute.value.query.username,
	userList: [],
	targetUser: null,
	msgText: '',
	messageBox: {},
})

const messageList = computed(() => {
	return state.messageBox[state.username] && state.targetUser
		? state.messageBox[state.username].filter((item) => {
				return (
					item.fromUsername === state.targetUser.username ||
					item.toUsername === state.targetUser.username
				)
		  })
		: []
})

const socket = io('http://localhost:3000', {
	query: {
		username: state.username,
	},
})

const selectUser = (userInfo) => {
	state.targetUser = userInfo
}

const sendMessage = () => {
	if (!state.msgText.length) return
	/**
	 * {
	 *  jibachao:[
	 *    {
	 *      fromUsername:xxx,
	 *      toUsername:xxx,
	 *      dateTime:xxx,
	 *      msg:xxx...
	 *    }
	 *  ]
	 * }
	 */
	appendMessage({
		fromUsername: state.username,
		toUsername: state.targetUser.username,
		msg: state.msgText,
		dateTime: new Date().getTime(),
	})

	socket.emit('send', {
		fromUsername: state.username,
		targetId: state.targetUser.id,
		msg: state.msgText,
	})
}

socket.on('online', (data) => {
	state.userList = data.userList
})

socket.on('receive', (data) => {
	appendMessage(data)
})

socket.on('error', (err) => {
	console.log(err)
})

function appendMessage(data) {
	!state.messageBox[state.username] && (state.messageBox[state.username] = [])
	state.messageBox[state.username].push(data)
}
</script>
