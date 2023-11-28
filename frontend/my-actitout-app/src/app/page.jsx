"use client";
import { useEffect, useState, useRef } from "react";
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { sanitize } from "isomorphic-dompurify";
import { useRouter } from 'next/navigation';
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { selectProperty } from '../selectors/useSelector';
import { setUser, set_username, set_userid } from "../store/User/userSlice";
import Load from "../../public/loading-white.gif"
import { Logo } from "../components/"
import { v1 } from "uuid"

import { getRandomRoom, createRoom, createUser, addPlayerToRoom } from "../api/api.mjs"


const Main = () => {
  const [avatarSvg, setAvatarSvg] = useState("");
  const username = useSelector(selectProperty('username'));

  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const { push } = useRouter();

  const roomCodeInput = useRef(null);

  useEffect(() => {
    setAvatarSvg(
      createAvatar(adventurer, {
        seed: username,
      })
    );
  }, [username]);

  const playGame = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      //  randomly finds a room from database and redirect to /lobby/roomid
      const roomData = await getRandomRoom();

      // Check if the room exists
      if (roomData.roomExists) {
        // Redirect to the existing room
        console.log("add user to existing room")
        const { roomId, screen } = roomData;

        const userId = await createUser(username);
        dispatch(set_userid(userId))

        addPlayerToRoom(roomId, userId)
          .then(() => {
            if (screen === "lobby") {
              push(`lobby/${roomId}`);
            }
            else {
              push(`game/${roomId}`);
            }
          })
          .catch((error) => {
            // Your code to handle any errors that occurred during the addition
            console.error(error);
          });

      }
      else {
        console.log("no room exist")

        // Create a new room  and make new user in db and then redirect to the newly created room
        const userId = await createUser(username);
        console.log(userId)
        dispatch(set_userid(userId))

        //create a room with owner id
        const roomData = await createRoom(userId);
        const { id } = roomData
        push(`lobby/${id}`);


      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }

  };

  const createGame = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const userId = await createUser(username);
      console.log(userId)
      dispatch(set_userid(userId))

      //create a room wiht owner id
      const roomData = await createRoom(userId);
      const { id } = roomData
      setLoading(false);
      push(`lobby/${id}`);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // const createRoom = async (event) => {
  //   event.preventDefault();
  //   setLoading(true);

  //   try {
  //     const roomId = v1();
  //     push(`room/${roomId}`);
  //     setLoading(false);
  //   } catch (err) {
  //     console.error(err);
  //     setLoading(false);
  //   }
  // };

  const joinRoom = async (event) => {
    event.preventDefault();

    try {
      let roomCode = roomCodeInput.current.value;
      console.log("Joining Room Code: " + roomCode);
      push(`room/${roomCode}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full dead-center">
      {loading ? (
        <img src={Load} alt="loading" />
      ) : (
        <div className=" flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <Logo />
          <div className="bg-blue-300 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="p-3 rounded-lg space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                  Hello {username}
                </label>
                <div className="mt-2">
                  <input
                    id="username"
                    name="username"
                    type="name"
                    value={username}
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    onChange={(e) =>
                      dispatch(set_username(e.target.value))
                    }
                  />
                </div>
                <div className="my-2 flex justify-center w-full">
                  <div
                    className="h-40 w-40"
                    dangerouslySetInnerHTML={{ __html: sanitize(avatarSvg) }}
                  ></div>
                </div>
              </div>

              <input
                id="join_room_code"
                name="join_room_code"
                type="text"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                ref={roomCodeInput}
              />

              <div>
                <button
                  className="block bg-green-500 hover:bg-green-600 w-full text-white rounded h-10 mt-4 mb-1"
                  onClick={playGame}
                >
                  Play
                </button>
                <button
                  className="block bg-green-500 hover:bg-green-600 w-full text-white rounded h-10 mt-4 mb-1"
                  onClick={createGame}
                >
                  Create A Game
                </button>
                <button
                  className="block bg-green-500 hover:bg-green-600 w-full text-white rounded h-10 mt-4 mb-1"
                  onClick={createRoom}
                >
                  Create A Room
                </button>
                <button
                  className="block bg-green-500 hover:bg-green-600 w-full text-white rounded h-10 mt-4 mb-1"
                  onClick={joinRoom}
                >
                  Join A Room
                </button>
              </div>


            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Main;



