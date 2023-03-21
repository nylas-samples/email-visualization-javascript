import "./styles.css";

import { FoamTree } from "@carrotsearch/foamtree";
import { groups } from './categorization';

new FoamTree({
  id: "app",
  dataObject: groups,
  parentFillOpacity: 0.9,
  layout: "squarified"
});
