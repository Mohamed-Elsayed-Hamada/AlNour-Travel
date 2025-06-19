var widebotGlobalKey = "_widebot_";
var isWebChatLoaded = new Promise(function (resolve, reject) {
  window.widebot = (function () {
    var cssId = "botchat-css";
    var jsId = "chatbotScript";
    var botNodeId = "widebot-chat-container";

    var wideBotChatContainerId = "inner-chat-container";
    var globalConfigs = {};

    // for development
    // var jsScriptURL = 'https://widebot-webchat.s3.amazonaws.com/webchat-dev/botchat.js';
    // var cssURL = 'https://widebot-webchat.s3.amazonaws.com/webchat-dev/botchat.css';
    // var configsURL = "https://gateway-dev.widebot.net/backend/WebChatConfig/";
    // var fingerprintURL = 'https://widebot-webchat.s3.amazonaws.com/webchat-dev/fingerprint2.min.js';

    // // for test
    // var jsScriptURL =
    //   "https://widebot-webchat.s3.amazonaws.com/test/botchat.js";
    // var cssURL = "https://widebot-webchat.s3.amazonaws.com/test/botchat.css";
    // var configsURL = "https://gateway-qc.widebot.net/backend/WebChatConfig/";
    // var fingerprintURL =
    //   "https://widebot-webchat.s3.amazonaws.com/test/fingerprint2.min.js";

    // for production
    var jsScriptURL =
      "https://widebot-webchat.s3.amazonaws.com/webchat-live/v1/botchat.js";
    var cssURL =
      "https://widebot-webchat.s3.amazonaws.com/webchat-live/v1/botchat.css";
    var configsURL = "https://gateway.widebot.net/backend/WebChatConfig/";
    var fingerprintURL =
      "https://widebot-webchat.s3.amazonaws.com/webchat-live/v1/fingerprint2.min.js";

    var directLineURL = "";

    var botToken;
    var userName;
    var botName;
    var botHeader;
    var pageId;
    var buttonImageSrc;
    var botAvatar;
    var mainColor = "#FF5100";
    var GetStartedMessage;
    var EnableWelcomeMessage;
    var EnableForm;
    var EnableVoice;
    var EnableAttach;
    var GetStartedImage;
    var BotDisplayName;
    var BackgroundImage;
    var HeaderImage;
    var HasWaterMark;
    var isGetStarted;
    var isOpened = false;
    var loader;
    var alreadySentFlow;
    var Font = "sans-serif";
    function loadJS(src, id, afterLoadingCB) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      if (id) {
        script.id = id;
      }
      if (script.readyState) {
        //IE
        script.onreadystatechange = function () {
          if (
            script.readyState == "loaded" ||
            script.readyState == "complete"
          ) {
            script.onreadystatechange = null;
            afterLoadingCB();
          }
        };
      } else {
        // Others
        script.onload = function () {
          afterLoadingCB();
        };
      }

      script.src = src;
      document.getElementsByTagName("head")[0].appendChild(script);
    }

    function loadCSS(src, id) {
      var cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.type = "text/css";
      cssLink.href = src;
      cssLink.media = "all";
      if (id) {
        cssLink.id = id;
      }

      document.getElementsByTagName("head")[0].appendChild(cssLink);
    }

    function extractOrigin(i) {
      var t;
      if (i.indexOf("://") > -1) {
        var l = i.split("/");
        (t = l[2]), (t = t.split("?")[0]), (t = l[0] + "//" + t);
      } else (t = i.split("/")[0]), (t = t.split("?")[0]);
      return t;
    }

    function loadBot(divName, cb) {
      var url =
          window.location != window.parent.location
            ? document.referrer
            : document.location.href,
        domain = extractOrigin(url);
      document.cookie =
        "UD_09091995_WIDEBOT=" + domain + ";path=/;Secure;HttpOnly";
      document.cookie = "EUD_24091996_WIDEBOT= ;path=/;Secure;HttpOnly";
      window["botchatDebug"] = "false" && "false" === "true";

      new Fingerprint2.get(function (components) {
        let result =
          localStorage.getItem("CID_1052018_WIDEBOTUUID" + pageId) || "";
        if (!result) {
          const newDate = Date.now();
          result = Fingerprint2.x64hash128(
            components
              .map(function (pair) {
                return pair.value;
              })
              .join() + newDate,
            31
          );
          localStorage.setItem("CID_1052018_WIDEBOTUUID" + pageId, result);
        }
        document.cookie =
          "CID_1052018_WIDEBOT=" +
          pageId +
          "-" +
          result +
          "; path=/;Secure;HttpOnly";

        var urlParams = new URLSearchParams(window.location.search);
        var isAutoClose = urlParams.get("autoClose");
        if (isAutoClose === "true") {
          window.close();
        }

        BotChat.App(
          {
            directLine: {
              token: botToken,
              domain: directLineURL,
              webSocket: "true",
            },
            user: {
              id: pageId + "-" + result,
              name: userName,
            },
            bot: {
              id: pageId,
              name: botName,
            },
            resize: "detect",
          },

          document.getElementById(divName)
        );
        // var header = document.getElementsByClassName("wc-header")[0];
        // header.children[0].textContent = botHeader;

        var span = document.getElementById("botHeader");
        if (span) {
          span.innerText = sanitizeHTML(botHeader);
        }

        // get the CSS variable ...
        bodyStyles = window.getComputedStyle(document.body);
        fontcolor = bodyStyles.getPropertyValue("--background"); //get

        document.body.style.setProperty(
          "--background",
          "url('" + botAvatar + "')"
        ); //set

        // // get the CSS variable ...
        // bodyStyles = window.getComputedStyle(document.body);
        // fontcolor = bodyStyles.getPropertyValue('--bottom'); //get

        // document.body.style.setProperty('--bottom', "50px"); //set

        cb();
      });
    }

    function loadLocals() {
      window["botchatDebug"] = true;
      refreshCSS();
      refreshJS();
      initConfigs(globalConfigs);
    }

    function refreshJS(isInit = false) {
      var oldScript = document.getElementById(jsId);
      if (oldScript) {
        oldScript.parentElement.removeChild(oldScript);
      }

      var botNode = document.getElementById(botNodeId);
      var botNodeParent;

      if (botNode) {
        botNodeParent = botNode.parentElement;
        botNodeParent.removeChild(botNode);
      }

      var devBot = document.createElement("div");
      devBot.setAttribute("id", botNodeId);
      botNodeParent.appendChild(devBot);
      globalConfigs.jsScriptURL = "http://localhost:8000/botchat.js";
      isOpened = false;
      if (isInit) {
        initConfigs(globalConfigs);
      }
    }

    function refreshCSS(isInit = false) {
      var botchatCSS = document.getElementById(cssId);
      var botChatCSSParent = botchatCSS.parentElement;
      botChatCSSParent.removeChild(botchatCSS);
      globalConfigs.cssURL = "http://localhost:8000/botchat.css";

      if (isInit) {
        initConfigs(globalConfigs);
      }
    }

    function init(encodedBotID) {
      let reqURL = configsURL + encodedBotID;
      fetch(reqURL)
        .then((response) => response.json())
        .then((configs) => {
          globalConfigs = configs;
          initConfigs(configs);
        })
        .catch((err) => {
          console.error("Error getting configs: ", err);
        });
    }

    function initConfigs(configs) {
      isOpened = false;

      if (document.getElementById(botNodeId)) {
        document.getElementById(botNodeId).remove();
      }

      configs.cssURL && (cssURL = configs.cssURL);
      configs.jsScriptURL && (jsScriptURL = configs.jsScriptURL);
      configs.directLineURL && (directLineURL = configs.directLineURL);
      configs.botToken && (botToken = configs.botToken);

      var userMetaFromStorage = JSON.parse(
        localStorage.getItem("userMeta" + window._widebot_.pageId)
      );
      if (
        userMetaFromStorage != null &&
        userMetaFromStorage.name &&
        userMetaFromStorage.name.length
      ) {
        userName = userMetaFromStorage.name;
      } else if (configs.userName) {
        userName = configs.userName;
      }

      configs.botName && (botName = configs.botName);
      configs.botHeader && (botHeader = configs.botHeader);

      if (configs.pageId) {
        pageId = configs.pageId;
      } else if (configs.botId) {
        pageId = configs.botId;
      }

      if (configs.configurations) {
        const CustomConfigs = configs.configurations.filter(
          (x) => x.Type === 9
        );
        if (CustomConfigs.length !== 0) {
          let metaDataValue = configs.configurations.find((x) => x.Metadata);
          if (metaDataValue) {
            let finalMetaData = JSON.parse(metaDataValue.Metadata);

            if (finalMetaData && finalMetaData.EnableEmojis) {
              configs.EnableEmojis = true;
            } else {
              configs.EnableEmojis = false;
            }

            if (finalMetaData && finalMetaData.EnableLocation) {
              configs.EnableLocation = true;
            } else {
              configs.EnableLocation = false;
            }

            if (finalMetaData && finalMetaData.HasWaterMark) {
              configs.HasWaterMark = true;
            } else {
              configs.HasWaterMark = false;
            }

            if (finalMetaData && finalMetaData.RTL) {
              configs.RTL = true;
            } else {
              configs.RTL = false;
            }

            if (finalMetaData && finalMetaData.EnableWelcomeMessage) {
              configs.EnableWelcomeMessage = finalMetaData.EnableWelcomeMessage;
            } else {
              configs.EnableWelcomeMessage = false;
            }

            if (finalMetaData && finalMetaData.EnableForm) {
              configs.EnableForm = finalMetaData.EnableForm;
            } else {
              configs.EnableForm = false;
            }

            if (finalMetaData && finalMetaData.EnableAttach) {
              configs.EnableAttach = finalMetaData.EnableAttach;
            } else {
              configs.EnableAttach = false;
            }

            if (finalMetaData && finalMetaData.EnableVoice) {
              configs.EnableVoice = finalMetaData.EnableVoice;
            } else {
              configs.EnableVoice = false;
            }

            if (finalMetaData && finalMetaData.Font) {
              configs.Font = finalMetaData.Font;
            } else {
              configs.Font = "sans-serif";
            }

            if (finalMetaData && finalMetaData.GetStartedMessage) {
              configs.GetStartedMessage = finalMetaData.GetStartedMessage;
            } else {
              configs.GetStartedMessage = "Get Started / ابدأ";
            }

            if (finalMetaData && finalMetaData.BackgroundImage) {
              configs.BackgroundImage = finalMetaData.BackgroundImage;
            } else {
              configs.BackgroundImage = "#FFF";
            }

            if (finalMetaData && finalMetaData.GetStartedImage) {
              configs.GetStartedImage = finalMetaData.GetStartedImage;
            } else {
              configs.GetStartedImage = "#FFF";
            }

            if (finalMetaData && finalMetaData.BotDisplayName) {
              configs.BotDisplayName = finalMetaData.BotDisplayName;
            } else {
              configs.BotDisplayName = "";
            }

            if (finalMetaData && finalMetaData.HeaderImage) {
              configs.HeaderImage = finalMetaData.HeaderImage;
            } else {
              configs.HeaderImage = "";
            }
          }
        }
      }
      if (
        configs.buttonImageSrc &&
        configs.buttonImageSrc.includes("https://")
      ) {
        buttonImageSrc = configs.buttonImageSrc;
      } else {
        buttonImageSrc =
          "https://widebot-webchat.s3.amazonaws.com/shared/widebot.png";
      }
      configs.mainColor && (mainColor = configs.mainColor);
      configs.Font && (Font = configs.Font);
      botAvatar =
        configs.botAvatar ||
        "https://widebot-webchat.s3.amazonaws.com/shared/widebot.png";
      // configs.HasWaterMark && (HasWaterMark = configs.HasWaterMark)
      configs.BackgroundImage && (BackgroundImage = configs.BackgroundImage);
      configs.GetStartedImage && (GetStartedImage = configs.GetStartedImage);
      configs.BotDisplayName && (BotDisplayName = configs.BotDisplayName);
      configs.GetStartedMessage &&
        (GetStartedMessage = configs.GetStartedMessage);
      configs.HeaderImage && (HeaderImage = configs.HeaderImage);
      if (configs.env && configs.env === "LOCAL") {
        configs.cssURL = cssURL = "http://localhost:8000/botchat.css";
        configs.jsScriptURL = jsScriptURL = "http://localhost:8000/botchat.js";
      }

      globalConfigs = configs;

      !!configs.isChangeLanguageSupported &&
        (window[widebotGlobalKey].isChangeLanguageSupported = true);
      !!configs.HasWaterMark && (window[widebotGlobalKey].HasWaterMark = true);
      !!configs.isGetStarted && (window[widebotGlobalKey].isGetStarted = true);
      !!configs.DisableUpload &&
        (window[widebotGlobalKey].DisableUpload = false);
      !!configs.EnableForm && (window[widebotGlobalKey].EnableForm = true);
      !!configs.EnableWelcomeMessage &&
        (window[widebotGlobalKey].EnableWelcomeMessage = true);
      !!configs.EnableVoice && (window[widebotGlobalKey].EnableVoice = true);
      !!configs.EnableAttach && (window[widebotGlobalKey].EnableAttach = true);
      !!configs.EnableLocation &&
        (window[widebotGlobalKey].EnableLocation = true);
      !!configs.EnableEmojis && (window[widebotGlobalKey].EnableEmojis = true);
      !!configs.RTL && (window[widebotGlobalKey].RTL = true);

      configs.zendeskKey &&
        (window[widebotGlobalKey].zendeskKey = configs.zendeskKey);
      pageId && (window[widebotGlobalKey].pageId = pageId);
      window[widebotGlobalKey].mainColor = mainColor;

      window[widebotGlobalKey].Font = Font;
      window[widebotGlobalKey].GetStartedMessage = GetStartedMessage;
      window[widebotGlobalKey].BackgroundImage = BackgroundImage;
      window[widebotGlobalKey].GetStartedImage = GetStartedImage;
      window[widebotGlobalKey].BotDisplayName = BotDisplayName;
      window[widebotGlobalKey].HeaderImage = HeaderImage;

      var popup = document.createElement("div");
      popup.dir = "ltr";
      popup.setAttribute("id", "tooltip");
      var tooltip = document.createElement("span");
      var closeBtn = document.createElement("button");

      popup.style = `font-family: sans-serif !important;position: fixed;cursor: pointer;z-index: 999999999; right: 40px; bottom: 85px; display: flex; flex-direction: column; align-items: end; margin: 0 0.5rem;`;
      tooltip.style = `background-color: white; border-radius: 10px; box-shadow: 0 0 10px rgba(0 , 0 , 0 , 0.1); color: black; padding: 15px;position: relative; max-width: 38ch;`;
      closeBtn.style = `position: relative;height: 40px; width: 120px; padding: 10px 20px;     margin-bottom: 5px; border-radius: 24px; visibility: hidden; border: none; background: #8AA1AC;color: #fff;cursor: pointer;`;

      popup.insertAdjacentElement("beforeend", tooltip);
      popup.insertAdjacentElement("afterbegin", closeBtn);

      tooltip.innerText = sanitizeHTML(configs.WelcomeMessage);
      closeBtn.innerText = sanitizeHTML(`Dismiss ✕`);

      popup.onmouseout = function () {
        closeBtn.style.visibility = "hidden";
      };
      popup.onmouseover = function (e) {
        closeBtn.style.visibility = "visible";
      };
      tooltip.addEventListener("click", displayToggle);
      closeBtn.addEventListener("click", hidePopup);

      var chatBotButton = document.createElement("img");
      chatBotButton.setAttribute("id", "kaec-chat-button");
      chatBotButton.setAttribute("src", buttonImageSrc);
      chatBotButton.style =
        "position: absolute;bottom: 10px;right: 10px;width: 70px;height: 70px;cursor: pointer;z-index: 999999999;filter: drop-shadow(0 0 1px gray);display: none; border-radius: 50%;object-fit: contain;";
      chatBotButton.addEventListener("click", displayToggle);

      var widebotChatContainer = document.createElement("div");
      widebotChatContainer.setAttribute("id", wideBotChatContainerId);
      if (allowDarkColors(mainColor)) {
        widebotChatContainer.setAttribute("class", "dark");
      }
      widebotChatContainer.style =
        "width: 100%;border: none;border-radius: 5px;height: 550px;max-height: calc(100vh - 90px);background: #ffff;position: absolute;bottom: 70px;right: 20px;box-shadow: 0 1rem 3rem rgba(0,0,0,.175) !important;transition: all 200ms;z-index: 99999999999;display: none;border-radius: 10px;";

      var chatAndButtonContainer = document.getElementById(botNodeId);
      if (!chatAndButtonContainer) {
        chatAndButtonContainer = document.createElement("div");
        chatAndButtonContainer.setAttribute("id", botNodeId);
        document.body.appendChild(chatAndButtonContainer);
      }
      chatAndButtonContainer.style =
        "position: fixed;bottom: 0;right: 20px;width: 400px;z-index: 999999;direction: ltr";

      if (configs.WelcomeMessage !== "" && configs.EnableWelcomeMessage) {
        chatAndButtonContainer.appendChild(popup);
      }
      chatAndButtonContainer.appendChild(widebotChatContainer);
      chatAndButtonContainer.appendChild(chatBotButton);

      checkWindowResize(widebotChatContainer, chatAndButtonContainer);

      if (isMobileFullScreen) {
        reEditStyle(
          chatAndButtonContainer,
          widebotChatContainer,
          chatBotButton
        );
        displayToggle();
      } else {
        window.addEventListener("resize", (e) => {
          // check if window resized to change webchat style
          checkWindowResize(widebotChatContainer, chatAndButtonContainer);
        });
      }

      if (openFullscreenMode) {
        openFullScreenMode(
          chatAndButtonContainer,
          widebotChatContainer,
          chatBotButton
        );
      }

      if (!localStorage.getItem("AUTO_AUDIO" + window._widebot_.pageId)) {
        localStorage.setItem("AUTO_AUDIO" + window._widebot_.pageId, "auto");
      }

      if (window[widebotGlobalKey].openedOnInit) {
        displayToggle();
      }

      if (window[widebotGlobalKey].autoSendFlowId) {
        let sentFlows = [];
        // Parse the serialized data back into an aray of objects
        sentFlows = JSON.parse(localStorage.getItem("sentFlows")) || [];
        alreadySentFlow = sentFlows.find(
          (id) => id === window._widebot_.autoSendFlowId
        );
        if (!alreadySentFlow) {
          displayToggle();
        }
      }

      loadCSS(cssURL, cssId);
      chatBotButton.style.display = "block";
      popup.style.display = "flex";
    }

    function checkWindowResize(widebotChatContainer, chatAndButtonContainer) {
      var mq = window.matchMedia("(max-width: 570px)");
      if (mq.matches) {
        widebotChatContainer.style.width = "auto";
        widebotChatContainer.style.left = "34px";

        chatAndButtonContainer.style.width = 100 + "%";
        chatAndButtonContainer.style.right = "20px";
      } else {
        widebotChatContainer.style.width = 100 + "%";
        widebotChatContainer.style.left = "initial";

        chatAndButtonContainer.style.width = "400px";
        chatAndButtonContainer.style.right = "50px";
      }
    }

    function displayToggle() {
      var tooltip = window.document.getElementById("tooltip");
      if (tooltip) {
        tooltip.style.display = "none";
      }
      var chatContainer = window.document.getElementById(
        wideBotChatContainerId
      );
      if (isOpened === false) {
        loader = document.createElement("div");
        loader.setAttribute("id", "loader");
        loader.style.borderTopColor = mainColor;
        chatContainer.appendChild(loader);
        loadJS(fingerprintURL, undefined, function () {
          loadJS(jsScriptURL, jsId, function () {
            loadBot(wideBotChatContainerId, function () {
              resolve(true);
            });
          });
        });
      }
      if (
        isOpened === false &&
        window[widebotGlobalKey].autoSendFlowId &&
        !alreadySentFlow
      ) {
        setTimeout(() => {
          openChat();
        }, 1000);
      } else {
        openChat();
      }
    }

    function hidePopup() {
      var tooltip = window.document.getElementById("tooltip");
      var chatContainer = window.document.getElementById(
        wideBotChatContainerId
      );
      tooltip.style.display = "none";
      chatContainer.style.display = "none";
    }

    function openChat() {
      var chatContainer = window.document.getElementById(
        wideBotChatContainerId
      );
      isOpened = true;
      var isVisible = chatContainer.style.display === "block";
      if (isVisible) {
        chatContainer.style.display = "none";
      } else {
        chatContainer.style.display = "block";
      }
    }

    function hideWidget(widgetEl) {
      return function () {
        widgetEl.style.display = isOpened ? "none" : "block";
      };
    }

    function fullScreenOnSmall() {
      if (window.screen.width <= 425) {
        setTimeout(() => {
          const webchatContainerM = document.getElementById(
            "widebot-chat-container"
          );
          const innerContainerM = document.getElementById(
            "inner-chat-container"
          );
          const chatBotButton = document.getElementById("kaec-chat-button");
          webchatContainerM.style += "inset: 0 !important;";
          innerContainerM.style += "inset: 0 !important;";
          innerContainerM.style += "height: 100%;";
          chatBotButton.addEventListener("click", hideWidget(chatBotButton));
        }, 500);
      }
    }

    return {
      init: init,
      initConfigs: initConfigs,
      refreshJS: refreshJS.bind(this, true),
      refreshCSS: refreshCSS.bind(this, true),
      loadLocals: loadLocals,
      fullScreenOnSmall,
    };
  })();
});

window.jsHandler = {
  postMessage: function () {},
};
window.webkit = {
  messageHandlers: {
    jsHandler: {},
  },
};
window[widebotGlobalKey] = {};
window[widebotGlobalKey].isWebChatLoaded = isWebChatLoaded;
window[widebotGlobalKey].fullMobileScreenWebChat = fullMobileScreenWebChat;
window[widebotGlobalKey].SetAutoSendFlow = SetAutoSendFlow;
window[widebotGlobalKey].setUserNameAndEmail = setUserNameAndEmail;
window[widebotGlobalKey].deleteUserNameAndEmail = deleteUserNameAndEmail;
window[widebotGlobalKey].clearUserHistory = clearUserHistory;
window[widebotGlobalKey].isDirectLineConnected = false;

var url_string = document.currentScript.src;
var url = new URL(url_string);
var urlParams = url.searchParams.get("botConfigs").split("?");
var encodedBotId = urlParams[0];
var otherParams = url_string.split("?").slice(2);
var openFullscreenMode = false;
var isMobileFullScreen = false;
var allowOnLoad = true;

window.onload = function () {
  if (encodedBotId && allowOnLoad) {
    widebot.init(encodedBotId);
  }
};

function setUserNameAndEmail(name, email) {
  // if (!name.length) {
  //   return
  // }

  var userMeta = {
    name: name,
  };
  var userEmail = {
    email: email,
  };

  localStorage.setItem(
    "userEmail" + window._widebot_.pageId,
    JSON.stringify(userEmail)
  );
  localStorage.setItem(
    "userMeta" + window._widebot_.pageId,
    JSON.stringify(userMeta)
  );
  widebot.init(encodedBotId);
}

function deleteUserNameAndEmail() {
  setUserNameAndEmail("user", "");

  widebot.init(encodedBotId);
}

function clearUserHistory() {
  var userHistoryKeys = [];
  var sentFlows = [];
  for (var i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i).indexOf("activities") != -1) {
      userHistoryKeys.push(localStorage.key(i));
    }
    if (localStorage.key(i).indexOf("sentFlows") != -1) {
      sentFlows.push(localStorage.key(i));
    }
  }

  sentFlows.forEach((key) => localStorage.removeItem(key));
  userHistoryKeys.forEach((key) => localStorage.removeItem(key));
  widebot.init(encodedBotId);
}

function allowDarkColors(color) {
  var r = parseInt(color.slice(1, 3), 16),
    g = parseInt(color.slice(3, 5), 16),
    b = parseInt(color.slice(5, 7), 16);
  var sum = Math.round(
    (parseInt(r) * 299 + parseInt(g) * 587 + parseInt(b) * 114) / 1000
  );
  return sum > 148 ? true : false;
}

function widgetInDOM() {
  return document.getElementById("kaec-chat-button");
}

function handleWidgetDir(dir) {
  checkExistence(
    widgetInDOM,
    () => {
      const widgetEl = document.getElementById("kaec-chat-button");
      const botNodeId = document.getElementById("widebot-chat-container");
      widgetEl.style.position = "fixed";
      if (dir.trim().toLowerCase() === "right") {
        widgetEl.style.right = "10px";
        widgetEl.style.left = "auto";
        botNodeId.style.right = "50px";
        botNodeId.style.left = "auto";
      } else if (dir.trim().toLowerCase() === "left") {
        widgetEl.style.left = "10px";
        widgetEl.style.right = "auto";
        botNodeId.style.left = "50px";
        botNodeId.style.right = "auto";
      } else {
        widgetEl.style.right = "10px";
        botNodeId.style.right = "50px";
        widgetEl.style.left = "auto";
        botNodeId.style.left = "auto";
      }
    },
    1000
  );
}

function checkExistence(condition, callback, interval) {
  const intervalId = setInterval(() => {
    if (condition()) {
      clearInterval(intervalId);
      callback();
    }
  }, interval);
}

// For making the Webchat take the fullscreen and remove widget
function fullMobileScreenWebChat() {
  if (encodedBotId) {
    isMobileFullScreen = true;
    allowOnLoad = false;
    widebot.init(encodedBotId);
  }
}

// To apply fullMobileScreenWebChat styles
function reEditStyle(container, chatPopUp, widget) {
  container.classList.add("full-size-mobile");
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.bottom = "0";
  container.style.right = "0";
  container.style.left = "initial";
  chatPopUp.style.width = "100%";
  chatPopUp.style.height = "100%";
  chatPopUp.style.right = "0";
  chatPopUp.style.left = "0";
  chatPopUp.style.bottom = "0";
  chatPopUp.style.borderRadius = "0";
  // widget.style.width = '60px !important'
  // widget.style.height = '60px !important'

  widget.remove();
}

// To apply fullscreen mode styles
function openFullScreenMode(container, chatPopUp, widget) {
  container.classList.add("full-size-mobile");
  container.style.width = "100vw";
  container.style.height = "100vh";
  container.style.bottom = "0";
  container.style.right = "0";
  container.style.left = "initial";
  chatPopUp.style.width = "100vw";
  chatPopUp.style.height = "100vh";
  chatPopUp.style.maxHeight = "100vh";
  chatPopUp.style.right = "0";
  chatPopUp.style.left = "0";
  chatPopUp.style.bottom = "0";
  chatPopUp.style.borderRadius = "0";
}

function SetAutoSendFlow(flowId = "") {
  if (encodedBotId) {
    window[widebotGlobalKey].autoSendFlowId = flowId;
    allowOnLoad = false;
    widebot.init(encodedBotId);
  }
}

function sanitizeHTML(html) {
  var temp = document.createElement("div");
  temp.textContent = html;
  return temp.innerHTML;
}

var lockResolver;
if (navigator && navigator.locks && navigator.locks.request) {
  const promise = new Promise((res) => {
    lockResolver = res;
  });

  navigator.locks.request("_widebot_", { mode: "shared" }, () => {
    return promise;
  });
}
