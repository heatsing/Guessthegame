import nextWorker from "./.open-next/worker.js";

const apex = "guessthegame.net";

const worker = {
  fetch(request, env, context) {
    const url = new URL(request.url);
    if (url.hostname === `www.${apex}` || (url.hostname === apex && url.protocol === "http:")) {
      url.hostname = apex;
      url.protocol = "https:";
      url.port = "";
      return Response.redirect(url, 308);
    }

    return nextWorker.fetch(request, env, context);
  },
};

export default worker;
