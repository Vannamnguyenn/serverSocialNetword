let users = [];

const editUsersCall = (data, id, call) => {
  const newData = data.map((u) => {
    return u.userID === id ? { ...u, call } : u;
  });

  return newData;
};

const handleSocket = (socket) => {
  // like post
  socket.on("likePost", (post) => {
    const usersNotify = users.filter((user) => post.user.followers.includes(user.userID));
    usersNotify.forEach((user) => {
      socket.to(`${user.socketID}`).emit("updatePost", post);
    });
  });
  // comment post
  socket.on("commentPost", (post) => {
    const usersNotify = users.filter((user) => post.user.followers.includes(user.userID));
    console.log(usersNotify);
    usersNotify.forEach((user) => {
      socket.to(`${user.socketID}`).emit("updatePost", post);
    });
  });
  // follow user
  socket.on("toggleFollow", (id) => {
    console.log(id);
    const user = users.find((user) => user.userID === id);
    user &&
      socket.to(`${user.socketID}`).emit(
        "toggleFollow",
        users.find((user) => user.socketID === socket.id)
      );
  });

  // add user
  socket.on("addUser", ({ _id }) => {
    users.push({
      socketID: socket.id,
      userID: _id,
    });
  });
  // notify
  socket.on("notify", (notify) => {
    const usersNotify = users.filter((user) => notify.recipients.includes(user.userID));
    console.log(usersNotify);
    usersNotify.forEach((user) => {
      socket.to(`${user.socketID}`).emit("notify", notify);
    });
  });
  // message
  socket.on("addMessage", (message) => {
    const user = users.find((user) => user.userID === message.recipients);
    user && socket.to(`${user.socketID}`).emit("addMessage", message);
  });
  // call to user
  socket.on("callUser", (msg) => {
    users = editUsersCall(users, msg.sender, msg.recipient);
    const client = users.find((user) => user.userID === msg.recipient);
    if (client) {
      if (client.call) {
        socket.emit("userBusy", msg);
        users = editUsersCall(users, msg.sender, null);
      } else {
        users = editUsersCall(users, msg.recipient, msg.sender);
        socket.to(`${client.socketID}`).emit("callToUser", msg);
      }
    }
  });
  // end call
  socket.on("endCallToUser", (data) => {
    const client = users.find((user) => user.userID === data.sender);
    if (client) {
      socket.to(`${client.socketID}`).emit("endCallToClient", data);
      users = editUsersCall(users, client.userID, null);
      if (client.call) {
        const client2 = users.find((user) => user.userID === client.call);
        if (client2) {
          socket.to(`${client2.socketID}`).emit("endCallToClient", data);
          users = editUsersCall(users, client2.userID, null);
        }
      }
    }
  });
  // disconnect
  socket.on("disconnect", () => {
    const client = users.find((user) => user.socketID === socket.id);
    if (client && client.call) {
      const client2 = users.find((user) => user.userID === client.call);
      if (client2) {
        socket.to(`${client2.socketID}`).emit("endCallToClient");
        users = editUsersCall(users, client2.userID, null);
      }
    }
    users = users.filter((user) => user.socketID !== socket.id);
  });
};

module.exports = handleSocket;
