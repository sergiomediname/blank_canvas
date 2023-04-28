(function () {
  'use strict';

  var COMMENT_FORM = document.getElementById('comment-form');
  var FORM_SCRIPT = document.getElementById('form-script');
  var FORM_RESTORE = document.getElementById('form-restore');
  var REPLY_BUTTONS = document.querySelectorAll('[data-parent-id]');
  var ACTIVE_CLASS = 'is-active';
  var REPLYING_CLASS = 'is-replying';
  var loadScript = function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };
  function loadRelayScript(textarea) {
    if (!textarea) return;
    var src = textarea.value.replace(/<script.*?src='(.*?)'.*?><\/script>/, '$1');
    textarea.remove();
    loadScript(src)
    // eslint-disable-next-line no-undef
    .then(function () {
      return BLOG_CMT_createIframe('https://www.blogger.com/rpc_relay.html');
    })["catch"](function (err) {
      return console.error(err);
    });
  }
  function createIframe(template, newSrc) {
    if (!template) return;
    var regex = /<iframe[^>]*\s+src="([^"]*)"/i;
    var match = template.match(regex);
    var originalSrc = match[1];
    var form = newSrc ? template.replace(originalSrc, newSrc) : template;
    return {
      originalSrc: originalSrc,
      form: form
    };
  }
  var replyComments = function replyComments(buttons) {
    // Load relay script
    loadRelayScript(FORM_SCRIPT);
    if (!buttons) {
      return;
    }
    var template = COMMENT_FORM.innerHTML;
    var _createIframe = createIframe(template),
      originalSrc = _createIframe.originalSrc,
      originalForm = _createIframe.form;
    var replyContainer = document.createElement('div');
    replyContainer.id = 'reply-form';
    var currentActiveButton;
    buttons.forEach(function (button) {
      button.onclick = function () {
        var parent = button.dataset.parentId;
        var container = document.querySelector("#c".concat(parent, " .comments-replies"));
        var currentReply = document.getElementById('reply-form');
        if (currentActiveButton === button) {
          return;
        }
        if (currentReply) {
          currentReply.remove();
        } else {
          COMMENT_FORM.innerHTML = '';
          FORM_RESTORE.classList.add(REPLYING_CLASS);
        }
        if (currentActiveButton) {
          currentActiveButton.classList.remove(ACTIVE_CLASS);
        }
        var newSrc = "".concat(originalSrc, "&parentID=").concat(parent);
        var _createIframe2 = createIframe(template, newSrc),
          newForm = _createIframe2.form;
        button.classList.add(ACTIVE_CLASS);
        currentActiveButton = button;
        replyContainer.innerHTML = newForm;
        container.insertAdjacentElement('afterbegin', replyContainer);
      };
    });
    if (!FORM_RESTORE) {
      return;
    }
    FORM_RESTORE.onclick = function () {
      if (currentActiveButton) {
        var currentReply = document.getElementById('reply-form');
        FORM_RESTORE.classList.remove(REPLYING_CLASS);
        COMMENT_FORM.innerHTML = originalForm;
        currentActiveButton.classList.remove(ACTIVE_CLASS);
        currentActiveButton = null;
        currentReply.remove();
      }
    };
  };
  replyComments(REPLY_BUTTONS);

})();
