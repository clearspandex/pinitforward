<template>
  <table v-if="curPage.length > 0" style="width: 1440px; margin: auto auto">
    <thead>
      <tr>
        <th>Objkt</th>
        <th>Title</th>
        <th>Creator</th>
        <th>Medium</th>
        <th>Description</th>
        <th>Token</th>
        <th>Unpin</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="objkt in curPage" :key="objkt?.id?.toString()">
        <td>
          <a v-if="objktLink(objkt)" :href="objktLink(objkt)">{{
            objkt.tokenId.length > 6
              ? objkt.tokenId.substring(0, 3) + "..." + objkt.tokenId.slice(-3)
              : objkt.tokenId
          }}</a>
          <span v-else>{{
            objkt.tokenId.substring(0, 3) + "..." + objkt.tokenId.slice(-3)
          }}</span>
        </td>
        <td style="font-style: italic">
          <a
            v-if="objkt.metadata?.artifactUri"
            :href="`https://dweb.link/ipfs/${
              objkt.metadata?.artifactUri?.split('//')[1]
            }`"
            >{{ objkt.metadata.name || "Untitled" }}</a
          >
          <span v-else>{{ objkt.metadata.name || "Untitled" }}</span>
        </td>

        <td>
          <a v-if="creatorLink(objkt)" :href="creatorLink(objkt)">{{
            creatorAlias(objkt)
          }}</a>
          <span v-else>{{ creatorAlias(objkt) }}</span>
        </td>
        <td>
          <span v-if="objkt?.metadata?.formats">{{
            objkt?.metadata?.formats.map((f) => f.mimeType).join(" | ")
          }}</span>
        </td>
        <td>{{ objkt?.metadata?.description }}</td>
        <td>
          {{ objkt?.contract?.alias ? objkt.contract.alias : " " }}
        </td>
        <!-- <td>
          <a :href="objkt.metadata">{{
            objkt.metadata !== "" ? objkt.metadata.slice(7, 15) + "..." : ""
          }}</a>
        </td> -->
        <td style="text-align: center">
          <span @click="unpin(objkt.id)" class="unpin">❌</span>
        </td>
      </tr>
    </tbody>
  </table>
  <div class="pagination">
    <div
      v-for="num in numPages"
      :key="num?.at(1)"
      @click="goToPage(num?.at(1))"
      :class="{ current: page === num?.at(1) }"
    >
      {{ num?.at(0) }}
    </div>
  </div>
</template>

<style scoped>
table {
  font-family: "Jost", sans-serif;
  border-collapse: collapse;
}

td,
th {
  border: 1px solid #0b3a53;
  padding: 0.5rem;
  text-align: left;
}

tbody tr:nth-child(odd) {
  background-color: rgb(250, 250, 250);
}

.unpin {
  cursor: pointer;
}

div.pagination {
  margin: 2em 1em;
  display: flex;
  justify-content: center;
}

div.pagination div {
  padding: 0 1em;
  cursor: pointer;
  margin: 0.1em;
  border: 1px solid #0b3a53;
}

div.pagination div:hover {
  background-color: #e6f2fd;
}

.current {
  background-color: #fde6ea;
}
</style>

<script>
import { get, del } from "idb-keyval";
//import { domainQuery, graphqlQuery } from "../helpers/queries";

export default {
  name: "Objkts",
  props: ["objkts", "ipfs"],
  emits: ["unpin"],
  data() {
    return {
      page: 0,
      perPage: 10,
    };
  },
  mounted() {
    this.goToPage(0);
  },
  computed: {
    numPages() {
      let pages = [];
      const numPages = Math.ceil(
        Object.keys(this.objkts || {}).length / this.perPage
      );

      if (numPages === 0) {
        return [];
      }

      for (let i = 0; i < numPages; i++) {
        pages.push([(i + 1).toString(), i]);
      }

      const first = pages.shift();
      const last = pages.length === 0 ? [] : [pages.pop()];

      if (pages.length > 7) {
        // do we need to truncate?
        if (this.page < 3) {
          //we are at the beginning
          pages = [...pages.slice(0, 3), ["...", 4]];
        } else if (this.page > numPages - 4) {
          //we are at the end
          pages = [["...", numPages - 5], ...pages.slice(numPages - 5)];
        } else {
          // we are in the middle pages
          pages = [
            ["...", this.page - 2],
            ...pages.slice(
              Math.max(this.page - 2, 0),
              Math.min(this.page + 2, pages.length)
            ),
            ["...", this.page + 3],
          ];
        }
      }

      return [first, ...pages, ...last];
    },
    curPage() {
      const start = this.perPage * this.page;
      const page = Object.values(this.objkts).slice(
        start,
        start + this.perPage
      );
      return page;
    },
  },
  methods: {
    goToPage(num) {
      this.page = num;
    },
    creatorLink(objkt) {
      if (!objkt?.metadata?.creators || objkt?.metadata?.creators?.length < 1) {
        return "";
      } else {
        return `https://tzkt.io/${objkt.metadata.creators[0]}`;
      }

      //   if (objkt?.creator?.twitter) {
      //     return `https://twitter.com/${objkt.creator.twitter}`;
      //   } else if (objkt?.creator?.site) {
      //     return objkt.creator.site;
      //   } else if (objkt?.creator?.address) {
      //     return `https://tzkt.io/${objkt.creator.address}`;
      //   } else {
      //     return undefined;
      //   }
    },
    creatorAlias(objkt) {
      //const tzDomains = "https://api.tezos.domains/graphql";
      let addr = "";

      if (!objkt?.metadata?.creators || objkt?.metadata?.creators?.length < 1) {
        addr = objkt.contract?.address;
      } else {
        addr = objkt.metadata.creators[0];
      }

      return addr.substring(0, 5) + "..." + addr.substring(addr.length - 5);

      //   const res = await graphqlQuery(
      //     tzDomains,
      //     domainQuery,
      //     { address: addr },
      //     "reverseRecords"
      //   );
      //   if (res.errors) {
      //     console.error(res.errors);
      //     return addr.substring(0, 5) + "..." + addr.substring(addr.length - 5);
      //   } else {
      //     return addr.substring(0, 5) + "..." + addr.substring(addr.length - 5);
      //   }

      // const domain = res.data.reverseRecords?.items?.domain;
      // if (domain) {
      //   const data = Object.fromEntries(domain.data);
      //   return data["twitter:handle"]
      //     ? data["twitter:handle"]
      //     : data["openid:website"]
      //     ? data["openid:website"]
      //     : domain.name;
      // } else {
      //   return addr.substring(0, 5) + "..." + addr.substring(addr.length - 5);
      // }
      // }
    },
    objktLink(objkt) {
      const urls = {
        "hic et nunc NFTs": "https://hic.af/objkt/",
        "Versum Items": "https://versum.xyz/token/versum/",
        "FXHASH GENTK": "https://www.fxhash.xyz/gentk/",
      };

      if (objkt?.contract?.alias && urls[objkt.contract.alias]) {
        return urls[objkt.contract.alias] + objkt.tokenId;
      } else {
        return `https://tzkt.io/${objkt?.contract?.address}`;
      }
    },
    async unpin(id) {
      const ipfsAssets = ["artifactUri", "displayUri", "thumbnailUri"];

      const objkt = await get(id);

      const cids = [];
      console.log(`Unpinning objkt ${objkt.id}`);

      for (let uri of ipfsAssets) {
        if (objkt[uri]) {
          const cid = objkt[uri].match(/^ipfs:\/\/(\S+)$/);
          if (cid) {
            cids.push(cid[1]);
          }
        }
      }

      for await (let c of this.ipfs.pin.rmAll(cids)) {
        console.log(`Removed CID: ${c}`);
      }

      await del(id);
      this.$emit("unpin", id);
    },
  },
};
</script>
