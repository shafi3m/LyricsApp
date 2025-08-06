import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-K4X3SRDNBB";

export const initGA = () => {
  ReactGA.initialize(MEASUREMENT_ID);
};

export const logPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};
