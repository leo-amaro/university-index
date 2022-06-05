Vue.component("weblink-preview", {
  data: function () {
    return {
      universityWebPageTitle: "Sample Title",
      universityWebpageDescription: "Sample description",
      universityWebPageImageUrl: "/images/bkg.jpg",
    };
  },
  props: {
    targetuniversity: Object,
  },
  methods: {
    fetchPreviewInfo: function () {
      function checkIfValidImageUrl(url, callback) {
        var image = new Image();

        image.onload = function () {
          if (this.width > 10) {
            callback(true, url);
          } else {
            callback(false, url);
          }
        };

        image.onerror = function () {
          callback(false, url);
        };

        image.src = url;
      }

      function decodeHtml(str) {
        let newStr = str.replace(/&#(\d+);/g, function (match, dec) {
          return String.fromCharCode(dec);
        });

        newStr = newStr.replace(/&amp;/g, "&");
        newStr = newStr.replace(/&nbsp;/g, " ");
        newStr = newStr.replace(/&lt;/g, "<");
        newStr = newStr.replace(/&gt;/g, ">");

        newStr = newStr.replace(/(<([^>]+)>)/gi, "");

        return newStr;
      }

      function getMiddleString(fullString, openingDelimiter, closingDelimiter) {
        let index1 = fullString.search(openingDelimiter);
        if (index1 != -1) {
          fullString = fullString.substr(
            index1 + openingDelimiter.length,
            fullString.length - index1 + 1
          );
        } else {
          return null;
        }

        let index2 = fullString.search(closingDelimiter);

        if (index2 != -1) {
          fullString = fullString.substr(0, index2);
        } else {
          return null;
        }

        return fullString.trim();
      }

      this.$emit("completion", false);
      this.universityWebPageTitle = null;
      this.universityWebPageDescription = null;
      this.universityWebPageImageUrl = null;

      if (
        this.targetuniversity != null &&
        this.targetuniversity.web_pages[0] != null
      ) {
        // fetch the title, description, and image URL
        // from the HTML at the url for preview generation

        // depends on the skycors (cross origin resource sharing)
        // service at skyRoute66

        fetch(
          "https://skycors.skyroute66.com/?target=" +
            this.targetuniversity.web_pages[0]
        )
          .then((response) => response.text())
          .then((html) => {
            let headSection = getMiddleString(html, "<head>", "</head>");

            if (headSection != null) {
              console.log(
                "To save processing time, we extracted the <head> section."
              );
            } else headSection = html;

            // find the og:title tag
            let title = getMiddleString(
              headSection,
              'og:title" content="',
              '"'
            );

            if (title != null && title != "") {
              title = decodeHtml(title);
            } else {
              // try to get the title tags

              title = getMiddleString(html, "<title>", "</title>");

              if (title != null && title != "") {
                title = decodeHtml(title);
              } else {
                title = this.targetuniversity.name;
              }
            }

            if (title.length > 88) {
              title = title.substr(0, 88) + "...";
            }

            // try to find the og:description tag
            let description = getMiddleString(
              headSection,
              'og:description" content="',
              '"'
            );

            if (description != null && description != "") {
              description = decodeHtml(description);
            } else {
              // try to get the first paragraph tags

              description = getMiddleString(html, "<p>", "</p>");

              if (description != null && description != "") {
                description = decodeHtml(description);
              } else {
                description = "Web page of " + this.targetuniversity.name;
              }
            }

            if (description.length > 150) {
              description = description.substr(0, 150) + "...";
            }

            // try to find the og:image tag

            let imageUrl = getMiddleString(
              headSection,
              'og:image" content="',
              '"'
            );

            if (imageUrl != null && imageUrl != "") {
              imageUrl = decodeHtml(imageUrl);
            } else {
              // try to get the first img tags

              imageUrl = getMiddleString(html, "<img", ">");

              if (imageUrl != null) {
                imageUrl = getMiddleString(imageUrl, 'src="', '"');

                if (imageUrl != null) {
                  if (imageUrl.substr(0, 4) != "http") {
                    imageUrl = this.targetuniversity.web_pages[0] + imageUrl;
                  }
                }
              }

              if (imageUrl != null && imageUrl != "") {
                imageUrl = decodeHtml(imageUrl);
                checkIfValidImageUrl(imageUrl, this.imageCallback);
              } else {
                imageUrl =
                  "https://images.unsplash.com/photo-1592303637753-ce1e6b8a0ffb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2767&q=80";
                console.log(
                  "As an alternative, image URL set to default = " + imageUrl
                );
              }
            }

            this.universityWebPageTitle = title;
            this.universityWebPageDescription = description;
            this.universityWebPageImageUrl = imageUrl;

            this.$emit("completion", true);
          })
          .catch((error) => {
            return {
              title: null,
              description: null,
              imageUrl: null,
            };
          });
      }
    },

    imageCallback: function (success, url) {
      if (success) {
        console.log(
          "imageCallback(): the first img src url valid, using it = " + url
        );
      } else {
        console.log(
          "imageCallBack(): the this.unviersityWebPageImageUrl = " +
            this.universityWebPageImageUrl
        );
        this.universityWebPageImageUrl =
          "https://images.unsplash.com/photo-1592303637753-ce1e6b8a0ffb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2767&q=80?nocache=yes";
        console.log(
          "imageCallback(): the first img src url is invalid, using default: " +
            this.universityWebPageImageUrl
        );
      }
    },
  },

  watch: {
    targetuniversity: function (newVal, oldVal) {
      this.fetchPreviewInfo();
    },
  },

  template: `
  <table
  class="link-preview-table"
  v-if="targetuniversity != null && universityWebPageTitle != null">
  <tr>
    <td
      class="link-preview-image"
      v-if="targetuniversity != null&&universityWebPageImageUrl != null"
    >
      <img
        v-if="targetuniversity != null"
        v-bind:src="universityWebPageImageUrl"
        alt="web page preview"
        height="38%"
      />
    </td>
    <td>
      <p class="link-preview-title" v-if="targetuniversity != null">
        {{ universityWebPageTitle }}
      </p>
      <p class="link-preview-description" v-if="targetuniversity != null">
        {{ universityWebPageDescription }}
      </p>
      <p class="link-preview-visit">
        <a v-bind:href="targetuniversity.web_pages[0]" target="_blank"
          >Visit >>></a>
      </p>
    </td>
  </tr>
</table>

  `,
});
