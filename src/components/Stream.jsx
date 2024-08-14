import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  AgoraVideoPlayer,
  createClient,
  createMicrophoneAndCameraTracks,
} from "agora-rtc-react";
import "./main.css";
import WebcamStreamCapture from "./Webcam";
const config = {
  mode: "live",
  codec: "vp8",
};

const appId = "8c59aaf317f947d7a5fcd8adba54b880";

const Recieve = () => {
  const [inCall, setInCall] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [host, setHost] = useState(false);
  return (
    <div className="wrp">
      {inCall ? (
        <VideoCall
          setInCall={setInCall}
          channelName={channelName}
          host={host}
        />
      ) : (
        <ChannelForm
          setInCall={setInCall}
          setChannelName={setChannelName}
          setHost={setHost}
        />
      )}
    </div>
  );
};

const useClient = createClient(config);
const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

const VideoCall = (props) => {
  const { setInCall, channelName } = props;
  const [users, setUsers] = useState([]);
  const [start, setStart] = useState(false);
  const { host } = props;

  const client = useClient();
  const { ready, tracks } = useMicrophoneAndCameraTracks();

  useEffect(() => {
    console.log("role is", host);
    // function to initialise the SDK
    let init = async (name) => {
      if (host === false) {
        await client.setClientRole("audience");
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          console.log("subscribe success");
          if (mediaType === "video") {
            setUsers((prevUsers) => {
              return [...prevUsers, user];
            });
          }
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        });

        client.on("user-unpublished", (user, type) => {
          console.log("unpublished", user, type);
          if (type === "audio") {
            user.audioTrack?.stop();
          }
          if (type === "video") {
            setUsers((prevUsers) => {
              return prevUsers.filter((User) => User.uid !== user.uid);
            });
          }
        });

        client.on("user-left", (user) => {
          console.log("leaving", user);
          setUsers((prevUsers) => {
            return prevUsers.filter((User) => User.uid !== user.uid);
          });
        });
      }
    };

    if (ready && tracks) {
      console.log("init ready");
      init(channelName);

      fetch(
        `https://us-central1-agore-node-express.cloudfunctions.net/app/access_token?channelName=${channelName}`
      ).then(function (response) {
        response.json().then(async function (data) {
          let token = data.token;
          console.log("Error to acquire", token);
          await client.join(appId, channelName, token, null);
          if (tracks && host === true) {
            await client.setClientRole("host");
            await client.publish([tracks[0], tracks[1]]);
          }
          setStart(true);
        });
      });
    }
  }, [channelName, client, ready, tracks]);

  return (
    <div className="">
      {ready && tracks && (
        <Controls tracks={tracks} setStart={setStart} setInCall={setInCall} />
      )}
      {start && tracks && <Videos users={users} tracks={tracks} host={host} />}
    </div>
  );
};

const Videos = (props) => {
  const { users, tracks, host } = props;

  return (
    <div className="parent">
      {users.length > 0 &&
        users.map((user) => {
          if (user.videoTrack) {
            return (
              <div
                key={user.uid}
                className="flex w-[100%] justify-center items-center"
              >
                <AgoraVideoPlayer
                  videoTrack={user.videoTrack}
                  className="border-solid border-4 rounded border-slate-900 vid mb-5"
                  style={{ height: "600px", width: "600px" }}
                />
              </div>
            );
          } else return null;
        })}
    </div>
  );
};

export const Controls = (props) => {
  const client = useClient();
  const { tracks, setStart, setInCall } = props;
  const [trackState, setTrackState] = useState({ video: true, audio: true });

  const mute = async (type) => {
    if (type === "audio") {
      await tracks[0].setEnabled(!trackState.audio);
      setTrackState((ps) => {
        return { ...ps, audio: !ps.audio };
      });
    } else if (type === "video") {
      await tracks[1].setEnabled(!trackState.video);
      setTrackState((ps) => {
        return { ...ps, video: !ps.video };
      });
    }
  };

  const leaveChannel = async () => {
    await client.leave();
    client.removeAllListeners();
    // we close the tracks to perform cleanup
    tracks[0].close();
    tracks[1].close();
    setStart(false);
    setInCall(false);
  };

  return (
    <div className="controls">
      <button
        className={trackState.audio ? "on warn" : "warn"}
        onClick={() => mute("audio")}
      >
        {trackState.audio ? "MuteAudio" : "UnmuteAudio"}
      </button>
      {/* <p className={trackState.video ? "on" : ""} onClick={() => mute("video")}>
      {trackState.video ? "MuteVideo" : "UnmuteVideo"}
    </p> */}
      {
        <button
          className="p-3 cursor-pointer text-white bg-red-900 rounded"
          style={{
            backgroundColor: "red",
          }}
          onClick={() => leaveChannel()}
        >
          Leave
        </button>
      }
    </div>
  );
};

const ChannelForm = (props) => {
  const { setInCall, setChannelName, setHost } = props;

  return (
    <>
      <h1 className="logo">
        PC<span className="ss">ONSIGHT</span>
      </h1>
      <form className="inputTaker">
        <h2>Please Enter ROOM Name to display cameras vision</h2>
        <p>
          NOTE: memorise it or keep it somewhere because it what will use for
          streaming on your phone!!
        </p>
        {appId === "" && (
          <p style={{ color: "red" }}>
            Please enter your Agora App ID in App.tsx and refresh the page
          </p>
        )}
        <input
          type="text"
          placeholder="Enter Room Name"
          onChange={(e) => setChannelName(e.target.value)}
        />
        <div className="btnWrapper">
          <button
            onClick={(e) => {
              e.preventDefault();
              setInCall(true);
              setHost(true);
            }}
          >
            Host
          </button>
          {/* <button
        className="rounded p-3 bg-slate-600 cursor-pointer text-white"
        onClick={(e) => {
          e.preventDefault();
          setInCall(true);
          setHost(false);
        }}
      >
        Watch it Now
      </button> */}
        </div>
      </form>
    </>
  );
};

export default Recieve;
