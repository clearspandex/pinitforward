<template>
  <div class="wrap">
    <search-pin
      :online="online"
      @results="pinObjkts"
      @progress="fetchProgress"
    ></search-pin>
    <main
      style="
        padding-top: 2em;
        display: flex;
        align-items: center;
        justify-content: center;
      "
      role="main"
    >
      <div v-if="!mobile">
        <ipfs-info
          @online="updateStatus"
          @ipfs="updateIpfs"
          :objkts="objkts"
        ></ipfs-info>
        <div class="container">
          <h2
            v-if="downloading"
            style="text-align: left; width: 350px; margin-top: 2em"
          >
            Fetching Objkt Metadata{{ ".".repeat(numEllipses % 4) }}
          </h2>
          <div v-else-if="pinning">
            <h3
              style="
                text-align: left;
                width: 420px;
                margin: 0.5em auto 0.5em auto;
              "
            >
              Adding
              <span class="coldlight"
                >{{ pinProgress + timeouts.length + 1 }} of
                {{ toPin }} Objkts</span
              >
              (<span class="highlight">{{ timeouts.length }} timeouts</span>){{
                ".".repeat(numEllipses % 4)
              }}
            </h3>
            <progress
              :value="pinProgress + timeouts.length"
              :max="toPin"
              style="width: 600px"
            ></progress>
          </div>
          <div
            class="section"
            v-if="
              online &&
              !pinning &&
              !downloading &&
              Object.keys(objkts).length < 1
            "
          >
            <h2>You are all set to start pinning 👍</h2>
            <hr style="margin: 3em 0" />
            <ol>
              <li>
                Enter any valid Tezos wallet address into the search bar above.
                This fetches the NFT metadata from
                <a href="https://data.objkt.com/docs/">data.objkt.com</a>.
              </li>
              <li>
                The metadata fetching is pretty fast but depending on the size
                of a collection, the actual
                <a href="https://docs.ipfs.io/how-to/pin-files/">pinning</a>
                could take some time to complete. The intermediate state is
                preserved so if you refresh/close the tab it will pickup where
                it left off.
              </li>
              <li>
                Everything is local to your web browser, no data/info is sent to
                any servers (except the initial query to
                <a href="https://data.objkt.com/docs/">data.objkt.com</a>).
              </li>
              <li>
                Occassionally there might be timeouts when pinning large/slow
                files... you can restart the process by re-submitting the
                search.
              </li>
              <li>
                <p>
                  You will continue to host the files for as long as your
                  <span class="highlight">IPFS node</span> is online (you can
                  close this tab once the pinning is complete).
                </p>
              </li>
              <li>
                Feel free to reach out to
                <a href="https://twitter.com/psychothan">@psychothan</a> or
                chime in on the
                <a href="https://discord.gg/kA8vFDUkr5">Discord server</a> if
                you have any questions, suggestions, or requests!
              </li>
            </ol>
          </div>
        </div>
        <div>
          <objkt-table
            :objkts="objkts"
            :ipfs="ipfs"
            @unpin="updateObjkts"
          ></objkt-table>
        </div>
      </div>
      <div
        style="
          height: 50vh;
          display: flex;
          align-items: center;
          justify-content: center;
        "
        v-else
      >
        <h1>GO to Your Computer!</h1>
      </div>
    </main>
  </div>
  <footer>
    <div class="footer">
      <div>
        <a href="https://twitter.com/psychothan">
          <img src="../img/icons/twitter.svg" class="icon" />
        </a>

        <a href="https://discord.gg/kA8vFDUkr5">
          <img src="../img/icons/discord.svg" class="icon" />
        </a>
        <a href="https://github.com/psychothan/pinitforward">
          <img src="../img/icons/github.svg" class="icon" />
        </a>
      </div>
      <div v-if="!mobile">
        🚧 THIS
        <span style="font-family: 'Jost', sans-serif">dApp</span>
        IS PROVIDED "AS IS",
        <a
          style="color: white"
          href="https://github.com/psychothan/pinitforward/blob/main/LICENSE"
          >WITHOUT WARRANTY</a
        >
        OF ANY KIND 🚧
      </div>
      <div>
        powered by
        <a href="https://tzkt.io/" style="color: white">TzKT API</a>
      </div>
    </div>
  </footer>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&family=Jost:ital,wght@0,100;0,300;0,400;0,700;1,300;1,400;1,700&family=Source+Code+Pro:ital,wght@0,400;0,700;1,400;1,700&family=Source+Sans+Pro:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap");

*,
*:before,
*:after {
  box-sizing: inherit;
}
html {
  box-sizing: border-box;
}
body {
  margin: 0;
}

ol {
  font-family: "Jost", sans-serif;
  font-size: 1.3em;
  text-align: left;
  margin: auto 2em;
}

li {
  margin-bottom: 1em;
  padding-left: 1em;
}

progress {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  /* Get rid of default border in Firefox. */
  border: none;
  width: 100%;
}

progress::-moz-progress-bar {
  background: #5694f1;
}

/* Safari and Chrome */
progress::-webkit-progress-bar {
  background: #e6f2fd;
}

progress::-webkit-progress-value {
  background: #5694f1;
}

#app {
  font-family: "Gloria Hallelujah", cursive;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: relative;
  min-height: 100vh;
}

.container {
  max-width: 1440px;
  margin: auto auto;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 20px;
}

.wrap {
  padding-bottom: 3rem;
}

.section {
  padding: 1em;
  min-width: 1200px;
}

span.highlight {
  color: #ff5c96;
  font-family: "Source Code Pro", monospace;
  font-weight: bold;
}

span.coldlight {
  color: #5694f1;
  font-family: "Source Code Pro", monospace;
  font-weight: bold;
}

footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 3rem;
  background-color: rgb(71, 117, 120);
}

.footer {
  color: white;
  max-width: 1440px;
  margin: auto auto;
  display: flex;
  height: 3rem;
  line-height: 3rem;
  justify-content: space-between;
  width: 100%;
}

.icon {
  width: 1.5em;
  vertical-align: middle;
  margin: 0 0.5em;
}

.icon svg {
  fill: white;
  color: white;
}
</style>

<script>
import { entries, set } from "idb-keyval";

import Search from "./components/Search.vue";
import Ipfs from "./components/Ipfs.vue";
import Objkts from "./components/Objkts.vue";

export default {
  name: "Pin it forward",
  components: {
    "search-pin": Search,
    "ipfs-info": Ipfs,
    "objkt-table": Objkts,
  },
  data() {
    return {
      online: false,
      ipfs: undefined,
      objkts: {},
      pinProgress: 0,
      toPin: 0,
      mobile: false,
      downloading: false,
      pinning: false,
      statusMsg: "Fetching Objkt Metadata",
      numEllipses: 0,
      timeouts: [],
    };
  },
  created() {
    window.addEventListener("resize", this.onResize);
  },
  mounted() {
    this.onResize();
    entries().then((res) => {
      console.log(`${res.length} Objkts found in local storage`);

      const local = {};
      for (const objkt of res) {
        local[objkt[0]] = objkt[1];
      }

      this.objkts = local;
    });
  },
  methods: {
    onResize() {
      this.mobile = window.innerWidth > 960 ? false : true;
    },
    updateStatus(online) {
      this.online = online;
    },
    updateIpfs(ipfs) {
      this.ipfs = ipfs;
    },
    updateObjkts(id) {
      delete this.objkts[id];
    },
    fetchProgress() {
      this.downloading = true;
      this.fetchTimer = setInterval(() => {
        this.numEllipses += 1;
      }, 800);
    },
    async pinObjkts(assets) {
      this.downloading = false;
      this.pinning = true;

      const ipfsAssets = ["artifactUri", "displayUri", "thumbnailUri"];

      this.pinProgress = 0;
      this.timeouts = [];
      this.toPin = assets.length;

      for (let asset of assets) {
        const ids = new Set();
        const objkt = asset.token.metadata;
        console.log(
          `Processing objkt ${asset.token.tokenId} of ${asset.token.contract.address}`
        );

        for (let uri of ipfsAssets) {
          if (objkt[uri]) {
            const cid = objkt[uri].match(/^ipfs:\/\/([^\\?]+)(\\?.*)?$/);

            if (cid) {
              ids.add(cid[1]);
            }
          }
        }

        for (let format of objkt.formats || []) {
          const cid = format.uri.match(/^ipfs:\/\/([^\\?]+)(\\?.*)?$/);

          if (cid) {
            ids.add(cid[1]);
          }
        }

        const cids = [];
        for (let v of ids.values()) {
          cids.push({ cid: v, recursive: true });
        }

        try {
          for await (let c of this.ipfs.pin.addAll(cids, { timeout: 60000 })) {
            console.log(`Pinned CID: ${c}`);
          }
        } catch (err) {
          console.log(err);
          if (err.name == "TimeoutError") {
            console.log(
              `Pinning ${objkt.name} failed due to timeout. Continuing...`
            );
            this.timeouts.push({ cids: cids, token: asset.token });
            continue;
          } else {
            throw err;
          }
        }

        console.log(`Stored ${asset.token.id}`);
        await set(asset.token.id, asset.token);
        this.objkts[asset.token.id] = asset.token;
        this.pinProgress += 1;
      }

      for (const [idx, asset] of this.timeouts.entries()) {
        try {
          for await (let c of this.ipfs.pin.addAll(asset.cids, {
            timeout: 600000,
          })) {
            console.log(`Pinned CID: ${c}`);
            this.timeouts.splice(idx, 1);
          }
        } catch (err) {
          console.log(err);
          if (err.name == "TimeoutError") {
            console.log(`Pinning failed due to timeout. Continuing...`);
            continue;
          } else {
            throw err;
          }
        }

        console.log(`Stored ${asset.token.id}`);
        await set(asset.token.id, asset.token);
        this.objkts[asset.token.id] = asset.token;
        this.pinProgress += 1;
      }

      this.pinning = false;
    },
  },
};
</script>
