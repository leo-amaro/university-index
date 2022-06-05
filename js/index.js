// extract the unique country names

const rawCountryList = universityJson.map((item) => item.country);
const countryList = rawCountryList.filter(
  (item, index, self) => self.indexOf(item) === index
);
countryList.sort();

Vue.component("v-select", VueSelect.VueSelect);

var app = new Vue({
  el: "#vue-app",
  data: {
    weblinkCompleted: false,
    countries: countryList,
    countrySelected: "",
    universities: [],
    universitySelected: null,
  },

  methods: {
    fetchUniversities: function () {
      let matches = universityJson.filter(
        (item) => item.country == this.countrySelected
      );
      matches.sort((lhs, rhs) => (lhs.name < rhs.name ? -1 : 1));
      this.universities = matches;
    },
  },
});
