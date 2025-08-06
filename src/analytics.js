import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-1RNF316DZE";

export const initGA = () => {
  ReactGA.initialize(MEASUREMENT_ID);
};

export const logPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};
