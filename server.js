const http = require("http");
const https = require("https");

const PORT = 8000;

function fetchHTML(callback) {
  const options = {
    hostname: "time.com",
    path: "/",
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0"  
    }
  };

  const req = https.request(options, (res) => {
    let body = "";

    res.on("data", (chunk) => {
      body += chunk;
    });

    res.on("end", () => {
      console.log("Fetched HTML length:", body.length);
      callback(body);
    });
  });

  req.on("error", (err) => {
    console.log("Error while fetching:", err);
    callback("");
  });

  req.end();
}

function extractStories(html) {
  let stories = [];
  let regex = /<a[^>]+href="(\/\d+[^"]+)"[^>]*>(.*?)<\/a>/gi;
  let match;
  let seen = new Set();

  while ((match = regex.exec(html)) !== null) {
    let link = "https://time.com" + match[1];
    let title = match[2].replace(/<[^>]+>/g, "").trim();

    if (title.length > 3 && !seen.has(link)) {
      stories.push({ title, link });
      seen.add(link);
    }
    if (stories.length === 6) break;
  }

  console.log("Extracted stories:", stories.length);
  return stories;
}

const server = http.createServer((req, res) => {
  if (req.url === "/getTimeStories") {
    fetchHTML((html) => {
      let stories = extractStories(html);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(stories, null, 2));
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log("Server started at http://localhost:" + PORT + "/getTimeStories");
});








