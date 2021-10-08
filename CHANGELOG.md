# Changelog

## [6.2.0](https://www.github.com/dasch-swiss/dsp-app/compare/v6.1.0...v6.2.0) (2021-10-08)


### Bug Fixes

* **error:** improve the current error handler in DSP-APP (DSP-1911) ([#540](https://www.github.com/dasch-swiss/dsp-app/issues/540)) ([0eb621b](https://www.github.com/dasch-swiss/dsp-app/commit/0eb621bbf9aa182d17b09df3ead46c34d357e0e5))
* gravsearch results now appear after page refresh ([#542](https://www.github.com/dasch-swiss/dsp-app/issues/542)) ([a88dd79](https://www.github.com/dasch-swiss/dsp-app/commit/a88dd790e6bf35931e9443a6745a5d75f47ce502))
* **resource-instance-form:** reloads cached resource to show changes made to the data model ([#547](https://www.github.com/dasch-swiss/dsp-app/issues/547)) ([37bb2a7](https://www.github.com/dasch-swiss/dsp-app/commit/37bb2a75cceeafffd8ee74f19af18648020e9704))


### Enhancements

* **ontology:** display id / name in property and class (DEV-37) ([#544](https://www.github.com/dasch-swiss/dsp-app/issues/544)) ([0a2bcfb](https://www.github.com/dasch-swiss/dsp-app/commit/0a2bcfbd5121bb9d49c18d3b45b0567ab7350e05))
* **search:** add missing search resource component (DEV-95) ([#548](https://www.github.com/dasch-swiss/dsp-app/issues/548)) ([79abd10](https://www.github.com/dasch-swiss/dsp-app/commit/79abd10d46f5398f2bc0a9170ea852b82f75f158))


### Maintenance

* **fulltext-search:** persist fulltext search term in input field (DSP-1674) ([#539](https://www.github.com/dasch-swiss/dsp-app/issues/539)) ([67a52a3](https://www.github.com/dasch-swiss/dsp-app/commit/67a52a32ef8285e16b37f6cd069a72ded763deab))
* **resource:** improve still image annotation form (DEV-53) ([#549](https://www.github.com/dasch-swiss/dsp-app/issues/549)) ([38bbe41](https://www.github.com/dasch-swiss/dsp-app/commit/38bbe4192add49171688df230eaa2df8f0aaa633))

## [6.1.0](https://www.github.com/dasch-swiss/dsp-app/compare/v6.0.0...v6.1.0) (2021-09-20)


### Bug Fixes

* **annotations:** empty annotations on upload of new region ([#536](https://www.github.com/dasch-swiss/dsp-app/issues/536)) ([075e6b1](https://www.github.com/dasch-swiss/dsp-app/commit/075e6b187a9a8886ce8ff56f0f0045210e0f2854))
* **links:** trust the external links (DSP-1904) ([#537](https://www.github.com/dasch-swiss/dsp-app/issues/537)) ([303ac3d](https://www.github.com/dasch-swiss/dsp-app/commit/303ac3dd450c52fc7468b90844244274a549b7b0))
* **resource-instance-form:** resource class name now updates correctly in the event that the name was changed and the page was not refreshed ([#531](https://www.github.com/dasch-swiss/dsp-app/issues/531)) ([5783d27](https://www.github.com/dasch-swiss/dsp-app/commit/5783d27b2e7641b8491f28d6f0245de4421bfc1f))
* **resource:** increase width of space between entries of incoming links (DSP-1908) ([#538](https://www.github.com/dasch-swiss/dsp-app/issues/538)) ([79b4d29](https://www.github.com/dasch-swiss/dsp-app/commit/79b4d2978161ae21ec5256c43f7a305a42ab2fe7))
* **still-image-viewer:** fix zoom buttons (DSP-1798) ([#533](https://www.github.com/dasch-swiss/dsp-app/issues/533)) ([b07ec63](https://www.github.com/dasch-swiss/dsp-app/commit/b07ec63f71ad96d92f0f7b562dd2804926fd9465))


### Enhancements

* **resource:** draw regions (DSP-1845) ([#524](https://www.github.com/dasch-swiss/dsp-app/issues/524)) ([f08706b](https://www.github.com/dasch-swiss/dsp-app/commit/f08706ba2e4e6c26022371c4345646884d19acca))
* textarea is now provided is the gui-element is a textarea ([#529](https://www.github.com/dasch-swiss/dsp-app/issues/529)) ([e80a4d2](https://www.github.com/dasch-swiss/dsp-app/commit/e80a4d27fbb364a9d752153e3ce73a7290b8336a))


### Maintenance

* **modules:** clean up imports and npm packages ([#535](https://www.github.com/dasch-swiss/dsp-app/issues/535)) ([4310ff7](https://www.github.com/dasch-swiss/dsp-app/commit/4310ff727dace99a275bf43bf3ca8ea3a480849b))
* openseadragon prod build fix (DSP-1779) ([#534](https://www.github.com/dasch-swiss/dsp-app/issues/534)) ([0a34eaa](https://www.github.com/dasch-swiss/dsp-app/commit/0a34eaac785a6d2d99a300483353ba59b65075f2))

## [6.0.0](https://www.github.com/dasch-swiss/dsp-app/compare/v5.3.0...v6.0.0) (2021-09-08)


### ⚠ BREAKING CHANGES

* **config:** update config file for better iiif support (DSP-1880) (#511)

### Bug Fixes

* **audio:** sanitize audio url (DSP-1819) ([#513](https://www.github.com/dasch-swiss/dsp-app/issues/513)) ([35871cd](https://www.github.com/dasch-swiss/dsp-app/commit/35871cdfd79e733d0692bf65e83141d1a09e0cbc))
* **deps:** fix security vulnerability ([#514](https://www.github.com/dasch-swiss/dsp-app/issues/514)) ([d793fb8](https://www.github.com/dasch-swiss/dsp-app/commit/d793fb885a60c76691bc1daefe771807d0eb6746))


### Enhancements

* **config:** update config file for better iiif support (DSP-1880) ([#511](https://www.github.com/dasch-swiss/dsp-app/issues/511)) ([b799600](https://www.github.com/dasch-swiss/dsp-app/commit/b799600b7345e6adf07fa784810e3f57abc91ac7))
* **resource:** display incoming links (DSP-1846) ([#507](https://www.github.com/dasch-swiss/dsp-app/issues/507)) ([9c3abce](https://www.github.com/dasch-swiss/dsp-app/commit/9c3abce7a01a509d041cbd569d603ab52c931dda))
* **resource:** optimize resource instance form (DSP-1256) ([#518](https://www.github.com/dasch-swiss/dsp-app/issues/518)) ([5151677](https://www.github.com/dasch-swiss/dsp-app/commit/51516773a81d97960d6340889b5455094d771cc7))


### Maintenance

* **action:** migrate action module (DSP-1852) ([#509](https://www.github.com/dasch-swiss/dsp-app/issues/509)) ([725c45e](https://www.github.com/dasch-swiss/dsp-app/commit/725c45eef3e56de5f3cbe1be4117b83ffa29ea0f))
* **core:** migrate core module from UI-lib (DSP-1853) ([#505](https://www.github.com/dasch-swiss/dsp-app/issues/505)) ([ea1cd55](https://www.github.com/dasch-swiss/dsp-app/commit/ea1cd55c1a0946915fd34278ff7fc10d3cc966d2))
* **deps:** bump dsp-js to latest version (DSP-1883) ([#521](https://www.github.com/dasch-swiss/dsp-app/issues/521)) ([c956d4b](https://www.github.com/dasch-swiss/dsp-app/commit/c956d4bdb609c1cc95baa3ffcecc0d57c30c1668))
* **deps:** bump dsp-ui to latest ([#502](https://www.github.com/dasch-swiss/dsp-app/issues/502)) ([5d79065](https://www.github.com/dasch-swiss/dsp-app/commit/5d790653243f8afd0fb8591658706d84e6294f9f))
* fix style in resource, search-panel and progress-indicator (DSP-1887) ([#520](https://www.github.com/dasch-swiss/dsp-app/issues/520)) ([854aff2](https://www.github.com/dasch-swiss/dsp-app/commit/854aff2d47bc601019239d4b855bde3b20b01d06))
* **gh-ci:** split workflow tasks ([#515](https://www.github.com/dasch-swiss/dsp-app/issues/515)) ([83d5874](https://www.github.com/dasch-swiss/dsp-app/commit/83d58748600daeb5eb98b1a53660981bb4a665d6))
* **login:** add autocomplete to login form (DSP-1892) ([#527](https://www.github.com/dasch-swiss/dsp-app/issues/527)) ([dd6be15](https://www.github.com/dasch-swiss/dsp-app/commit/dd6be150786cdcc2204cf2841f49fb05c8d1e090))
* **project:** handle mandatory keyword field (DSP-1829) ([#503](https://www.github.com/dasch-swiss/dsp-app/issues/503)) ([35f6e7b](https://www.github.com/dasch-swiss/dsp-app/commit/35f6e7b31c5c6bd25deb0751810cb5ac66809204))
* remove CoreModule dependency (DSP-1884) ([#519](https://www.github.com/dasch-swiss/dsp-app/issues/519)) ([8549104](https://www.github.com/dasch-swiss/dsp-app/commit/8549104be4bfdbe9bdc4362a1a82db0f0c1619c7))
* remove ViewerModule dependency (DSP-1890) ([#525](https://www.github.com/dasch-swiss/dsp-app/issues/525)) ([a99546e](https://www.github.com/dasch-swiss/dsp-app/commit/a99546ed52ecb5cdbbf2ebfae735a10738c04df4))
* removes ActionModule dependency ([#523](https://www.github.com/dasch-swiss/dsp-app/issues/523)) ([bd60f00](https://www.github.com/dasch-swiss/dsp-app/commit/bd60f00a77baef4909f30cc869b31ab849665ee0))
* removes SearchModule dependency ([#522](https://www.github.com/dasch-swiss/dsp-app/issues/522)) ([269be23](https://www.github.com/dasch-swiss/dsp-app/commit/269be23620e731c16db7c42f975f3667da0283e9))
* **resource:** migrate viewer from UI-lib (DSP-1850) ([#504](https://www.github.com/dasch-swiss/dsp-app/issues/504)) ([b742a98](https://www.github.com/dasch-swiss/dsp-app/commit/b742a987e2293bdc18bcf14e1b1174ee1f5c8180))
* **search:** migrate search module (DSP-1851) ([#510](https://www.github.com/dasch-swiss/dsp-app/issues/510)) ([fc7ea5c](https://www.github.com/dasch-swiss/dsp-app/commit/fc7ea5c5f1b6b225c20e41cbd3273aa8a1acc4d0))
* update imports step 1 (DSP-1882) ([#516](https://www.github.com/dasch-swiss/dsp-app/issues/516)) ([e7a2c4f](https://www.github.com/dasch-swiss/dsp-app/commit/e7a2c4f750ed166b23753ea8e34c4f695fad83e2))
* update remaining dsp-ui imports (DSP-1891) ([#526](https://www.github.com/dasch-swiss/dsp-app/issues/526)) ([43888a6](https://www.github.com/dasch-swiss/dsp-app/commit/43888a67497e3aa93b5031f00c2bc719221eca8c))

## [5.3.0](https://www.github.com/dasch-swiss/dsp-app/compare/v5.2.1...v5.3.0) (2021-08-12)


### Maintenance

* **header:** clean up code and use notification service after login ([#498](https://www.github.com/dasch-swiss/dsp-app/issues/498)) ([fb6c368](https://www.github.com/dasch-swiss/dsp-app/commit/fb6c36890f78ea7612f86c2a2978d9c6908b890d))
* **ontology:** update create ontology tooltip for unique name (DSP-1139) ([#500](https://www.github.com/dasch-swiss/dsp-app/issues/500)) ([946d00f](https://www.github.com/dasch-swiss/dsp-app/commit/946d00f494e7f03651084909f5c37c80b394669f))


### Enhancements

* **resource:** create link / collection resource (DSP-1835) ([#501](https://www.github.com/dasch-swiss/dsp-app/issues/501)) ([8060756](https://www.github.com/dasch-swiss/dsp-app/commit/8060756d4b13abdcd26f822f4caec25702c88466))
* **workspace:** add intermediate view (DSP-1834) ([#494](https://www.github.com/dasch-swiss/dsp-app/issues/494)) ([d0e475a](https://www.github.com/dasch-swiss/dsp-app/commit/d0e475adfb55e5538164b16d169e0b9a4e6be702))

### [5.2.1](https://www.github.com/dasch-swiss/dsp-app/compare/v5.2.0...v5.2.1) (2021-08-03)


### Maintenance

* **deps:** bump dsp-ui to latest version (DSP-1838) ([#495](https://www.github.com/dasch-swiss/dsp-app/issues/495)) ([4adc49a](https://www.github.com/dasch-swiss/dsp-app/commit/4adc49a039b325906a27a20a8cc1002796105b45))

## [5.2.0](https://www.github.com/dasch-swiss/dsp-app/compare/v5.1.0...v5.2.0) (2021-08-02)


### Enhancements

* **resource:** add comparison view (DSP-1796) ([#490](https://www.github.com/dasch-swiss/dsp-app/issues/490)) ([731ea04](https://www.github.com/dasch-swiss/dsp-app/commit/731ea04a8f20eae809f8d8d184af5c19e40ecabf))
* **resource:** update resource's label (DSP-1801) ([#492](https://www.github.com/dasch-swiss/dsp-app/issues/492)) ([e2c9867](https://www.github.com/dasch-swiss/dsp-app/commit/e2c98678c31712054fafe6c9193b8ca5865792a4))
* improve error handler and fix search results issue (DSP-1826 / DSP-1831) ([#493](https://www.github.com/dasch-swiss/dsp-app/issues/493)) ([fa2f4b0](https://github.com/dasch-swiss/dsp-app/commit/70a263c0cb324d82a82070de5fb7c3dedfa2f4b0))


## [5.1.0](https://www.github.com/dasch-swiss/dsp-app/compare/v5.0.0...v5.1.0) (2021-07-26)


### Bug Fixes

* **ontology:** fix regex pattern in ontology form (DSP-1139) ([#483](https://www.github.com/dasch-swiss/dsp-app/issues/483)) ([4d0703f](https://www.github.com/dasch-swiss/dsp-app/commit/4d0703fde8d42d55a2bf90ecd62c40c269251abd))


### Documentation

* **user-guide:** update user-guide about ontology (DSP-976) ([#480](https://www.github.com/dasch-swiss/dsp-app/issues/480)) ([e12f196](https://www.github.com/dasch-swiss/dsp-app/commit/e12f1966a4c354a2e613d9a4deb6989196482dfc))


### Maintenance

* **ontology:** better regex for onto name (DSP-1139) ([#488](https://www.github.com/dasch-swiss/dsp-app/issues/488)) ([ec881ef](https://www.github.com/dasch-swiss/dsp-app/commit/ec881ef60a2c802a2b65a3e047a40d768bc08cf6))
* **resource:** hide file value in properties (DSP-1261) ([#484](https://www.github.com/dasch-swiss/dsp-app/issues/484)) ([4ade17f](https://www.github.com/dasch-swiss/dsp-app/commit/4ade17f86e91d28b9a751e63b4d6480dfa1d5939))


### Enhancements

* **resource:** add document viewer with download (DSP-1791) ([#485](https://www.github.com/dasch-swiss/dsp-app/issues/485)) ([ce51bce](https://www.github.com/dasch-swiss/dsp-app/commit/ce51bce48b63fc7abb4bb6f55ea2de0de435ece9))
* **resource:** audio player (DSP-1805) ([#487](https://www.github.com/dasch-swiss/dsp-app/issues/487)) ([bf372dc](https://www.github.com/dasch-swiss/dsp-app/commit/bf372dc41c7da0a4c2e3263f1d3cace5e7eedc64))
* **resource:** delete and erase resource (DSP-1228) ([#489](https://www.github.com/dasch-swiss/dsp-app/issues/489)) ([8b1fdba](https://www.github.com/dasch-swiss/dsp-app/commit/8b1fdbae18e112a81af0150cb9ac102a5e408628))
* **resource:** upload audio (DSP-1799) ([#486](https://www.github.com/dasch-swiss/dsp-app/issues/486)) ([d865df5](https://www.github.com/dasch-swiss/dsp-app/commit/d865df5fc95a9c26a02aafbd18b8ed9621f81d0e))
* **resource:** upload pdf document (DSP-1776) ([#481](https://www.github.com/dasch-swiss/dsp-app/issues/481)) ([d916b4b](https://www.github.com/dasch-swiss/dsp-app/commit/d916b4be6189fb764a6e4a92aa0999a88d71f40a))

## [5.0.0](https://www.github.com/dasch-swiss/dsp-app/compare/v4.11.1...v5.0.0) (2021-07-05)


### ⚠ BREAKING CHANGES

* **upload:** add upload form for still images (DSP-1761) (#472)
* **config:** add geoname config (DSP-1672) (#473)

### Documentation

* **ontology:** update docs and show hint in ontology-form (DSP-1139) ([#476](https://www.github.com/dasch-swiss/dsp-app/issues/476)) ([927237d](https://www.github.com/dasch-swiss/dsp-app/commit/927237ddc5d36ea5ff6f59a48465890d607ba8c0))


### Enhancements

* **config:** add geoname config (DSP-1672) ([#473](https://www.github.com/dasch-swiss/dsp-app/issues/473)) ([d4222ba](https://www.github.com/dasch-swiss/dsp-app/commit/d4222bacb3e8d85ecaf23eb9881e81c183f96681))
* **ontology:** add property to res class that is in use (DSP-1631) ([#477](https://www.github.com/dasch-swiss/dsp-app/issues/477)) ([b18e6ec](https://www.github.com/dasch-swiss/dsp-app/commit/b18e6ecba2afb3059ef75fb20c3d5699468e8335))
* **ontology:** change gui element for text value properties ([#478](https://www.github.com/dasch-swiss/dsp-app/issues/478)) ([6af1f7e](https://www.github.com/dasch-swiss/dsp-app/commit/6af1f7e74dd9199bda236a5d088a59a17b2dc5d8))
* **ontology:** display description for default and existing props (DSP-1154) ([#475](https://www.github.com/dasch-swiss/dsp-app/issues/475)) ([8be7e55](https://www.github.com/dasch-swiss/dsp-app/commit/8be7e5514f548b2f7be8cd53dbc2ca749ccda9c5))
* **upload:** add upload form for still images (DSP-1761) ([#472](https://www.github.com/dasch-swiss/dsp-app/issues/472)) ([2f314a2](https://www.github.com/dasch-swiss/dsp-app/commit/2f314a281cd257671c6c789d90e31936c87da01f))


### Maintenance

* **deps:** bump jdnconvertiblecalendar to v0.0.7 (DSP-1770) ([#479](https://www.github.com/dasch-swiss/dsp-app/issues/479)) ([b2ec64a](https://www.github.com/dasch-swiss/dsp-app/commit/b2ec64a7193159237009db30baccff51d540405f))

### [4.11.1](https://www.github.com/dasch-swiss/dsp-app/compare/v4.11.0...v4.11.1) (2021-06-23)


### Documentation

* **search:** add advanced search user guide (DSP-1662) ([#470](https://www.github.com/dasch-swiss/dsp-app/issues/470)) ([30edc96](https://www.github.com/dasch-swiss/dsp-app/commit/30edc96a3568ee45424b557ad2a6eea6381e486a))
* **user-guide:** fix navigation links ([#468](https://www.github.com/dasch-swiss/dsp-app/issues/468)) ([49c68f8](https://www.github.com/dasch-swiss/dsp-app/commit/49c68f803b646761a38deb00cd29681e40cf7d62))


### Maintenance

* fix dead links to the documentation ([#471](https://www.github.com/dasch-swiss/dsp-app/issues/471)) ([d7ae022](https://www.github.com/dasch-swiss/dsp-app/commit/d7ae0223b75fc21ab9b976ea831adbd86ec32a5c))

## [4.11.0](https://www.github.com/dasch-swiss/dsp-app/compare/v4.10.1...v4.11.0) (2021-06-22)


### Enhancements

* **ontology:** check if an ontology, a class or a property can be deleted (DSP-1750) ([#457](https://www.github.com/dasch-swiss/dsp-app/issues/457)) ([fb0c275](https://www.github.com/dasch-swiss/dsp-app/commit/fb0c275c224a58823ab00a76460c83c024ef735b))


### Maintenance

* empty landing page instead login (DSP-1756) ([#466](https://www.github.com/dasch-swiss/dsp-app/issues/466)) ([32cd462](https://www.github.com/dasch-swiss/dsp-app/commit/32cd4622624799ae4884f5cede342629b2ab5719))
* **gh-ci:** update docs deployment (DSP-1741) ([#463](https://www.github.com/dasch-swiss/dsp-app/issues/463)) ([6415152](https://www.github.com/dasch-swiss/dsp-app/commit/6415152debca4ed218c917ab0243d100e31d0708))


### Documentation

* refactor documentation and set correct links ([#467](https://www.github.com/dasch-swiss/dsp-app/issues/467)) ([cbeb274](https://www.github.com/dasch-swiss/dsp-app/commit/cbeb274f5cf871df2362003f30a5a3bf474ec81b))

### [4.10.1](https://www.github.com/dasch-swiss/dsp-app/compare/v4.10.0...v4.10.1) (2021-06-15)


### Documentation

* fix dead links and replace screenshots in project ([#460](https://www.github.com/dasch-swiss/dsp-app/issues/460)) ([a13b8ba](https://www.github.com/dasch-swiss/dsp-app/commit/a13b8bafaf3771a406d5d3264c70bebb917baedc))
* prepare documentation for docs.dasch.swiss (DSP-1721) ([#458](https://www.github.com/dasch-swiss/dsp-app/issues/458)) ([09259f1](https://www.github.com/dasch-swiss/dsp-app/commit/09259f1ad5badc1bd0eb910776417f07fdc62c68))


### Maintenance

* **analytics:** add fathom ([#462](https://www.github.com/dasch-swiss/dsp-app/issues/462)) ([f1e0244](https://www.github.com/dasch-swiss/dsp-app/commit/f1e0244289f58810dbdd269aa73fb00c15a012ea))
* **cookie-policy:** reactivate the cookie policy banner (DSP-1727) ([#461](https://www.github.com/dasch-swiss/dsp-app/issues/461)) ([ac99fbc](https://www.github.com/dasch-swiss/dsp-app/commit/ac99fbc74c0322eaa50a6bb510124714c72aa070))

## [4.10.0](https://www.github.com/dasch-swiss/dsp-app/compare/v4.9.1...v4.10.0) (2021-06-07)


### Enhancements

* **ontology:** new cardinality workflow (DSP-1652) ([#455](https://www.github.com/dasch-swiss/dsp-app/issues/455)) ([f1d049c](https://www.github.com/dasch-swiss/dsp-app/commit/f1d049cce629ce212a80b00c857a1b9778977f4f))

### [4.9.1](https://www.github.com/dasch-swiss/dsp-app/compare/v4.9.0...v4.9.1) (2021-05-26)


### Maintenance

* **resource:** improve list of properties in resource viewer ([#453](https://www.github.com/dasch-swiss/dsp-app/issues/453)) ([49d9b7f](https://www.github.com/dasch-swiss/dsp-app/commit/49d9b7f2c1689c7fa7f572e09b47516253c05b60))

## [4.9.0](https://www.github.com/dasch-swiss/dsp-app/compare/v4.8.0...v4.9.0) (2021-05-26)


### Bug Fixes

* disable progress bar if search results are empty (DSP-1575) ([#442](https://www.github.com/dasch-swiss/dsp-app/issues/442)) ([8c67d60](https://www.github.com/dasch-swiss/dsp-app/commit/8c67d6007f5d268bac337c6e9702a39ca01704ad))
* **resource:** add if condition (DSP-1655) ([#448](https://www.github.com/dasch-swiss/dsp-app/issues/448)) ([656da04](https://www.github.com/dasch-swiss/dsp-app/commit/656da04effaedb8cb62c8cd6ad31081a4763adc0))


### Documentation

* update documentation about contribution (DSP-1657) ([#449](https://www.github.com/dasch-swiss/dsp-app/issues/449)) ([c25280d](https://www.github.com/dasch-swiss/dsp-app/commit/c25280db676b7d5e9fd59583b1151b846f64ce8e))


### Enhancements

* **resource:** display region annotations in still images (DSP-1585) ([#445](https://www.github.com/dasch-swiss/dsp-app/issues/445)) ([86e75b9](https://www.github.com/dasch-swiss/dsp-app/commit/86e75b9fc540dde01590257d786fb65ee7af2c9c))
* **search:** specify linked resource in advanced search (DSP-1661) ([#451](https://www.github.com/dasch-swiss/dsp-app/issues/451)) ([3f0d6d9](https://www.github.com/dasch-swiss/dsp-app/commit/3f0d6d9a29a9ec299bf38cfa7782ef2eaec151bb))


### Maintenance

* **deps:** update packages to resolve security issues ([#450](https://www.github.com/dasch-swiss/dsp-app/issues/450)) ([8e927f7](https://www.github.com/dasch-swiss/dsp-app/commit/8e927f777c9c9801ab724d4750f6fccd2bcd97d0))
* **project:** resolve regex term (DSP-1654) ([#444](https://www.github.com/dasch-swiss/dsp-app/issues/444)) ([739beba](https://www.github.com/dasch-swiss/dsp-app/commit/739bebab58e6a89cb79a8d85cf1d3d5f514f23f0))

## [4.8.0](https://www.github.com/dasch-swiss/dsp-app/compare/v4.7.0...v4.8.0) (2021-05-21)


### Maintenance

* **CD/CI:** automatically detect common vulnerabilities and coding errors ([#438](https://www.github.com/dasch-swiss/dsp-app/issues/438)) ([af02332](https://www.github.com/dasch-swiss/dsp-app/commit/af023322f1fd03c2659c7127adcd856ac9e6f25d))
* **compiler:** enable strict template (DSP-1403) ([#432](https://www.github.com/dasch-swiss/dsp-app/issues/432)) ([583a338](https://www.github.com/dasch-swiss/dsp-app/commit/583a338d99fa8dca74c07182d0471219c382f9d1))
* **environment:** add test-server config (DSP-1650) ([#443](https://www.github.com/dasch-swiss/dsp-app/issues/443)) ([a56a45b](https://www.github.com/dasch-swiss/dsp-app/commit/a56a45ba84f3f62e7b5b1d32fc42954099827280))
* Replace favicon and term Knora by DSP (DSP-1181 / DSP-1342) ([#441](https://www.github.com/dasch-swiss/dsp-app/issues/441)) ([3b038b6](https://www.github.com/dasch-swiss/dsp-app/commit/3b038b688f8db9da86aa74c2811d93250541d860))


### Enhancements

* **ontology:** new method to change gui order (DSP-1567/DSP-1646) ([#440](https://www.github.com/dasch-swiss/dsp-app/issues/440)) ([dfd0ce0](https://www.github.com/dasch-swiss/dsp-app/commit/dfd0ce094fbfb047a16d86c59e4edc6f005281d2))

## [4.7.0](https://www.github.com/dasch-swiss/dsp-app/compare/v4.6.0...v4.7.0) (2021-05-07)


### Maintenance

* **search results:** disable grid view (DSP-1597) ([#435](https://www.github.com/dasch-swiss/dsp-app/issues/435)) ([c4726fe](https://www.github.com/dasch-swiss/dsp-app/commit/c4726fe08db97a907a2b98dc38d3287323ffa55e))


### Enhancements

* **DMP:** own resource viewer (DSP-1586) ([#434](https://www.github.com/dasch-swiss/dsp-app/issues/434)) ([35bd7b3](https://www.github.com/dasch-swiss/dsp-app/commit/35bd7b342424e1db6d6c788cf3dff0c4c4e5d446))

## [4.6.0](https://www.github.com/dasch-swiss/dsp-app/compare/v4.5.2...v4.6.0) (2021-04-27)


### Enhancements

* **DMP:** bring back the workspace ([#431](https://www.github.com/dasch-swiss/dsp-app/issues/431)) ([e8b1c8e](https://www.github.com/dasch-swiss/dsp-app/commit/e8b1c8e97c244152b7e7df172c2e9932ee4991ae))

### [4.5.2](https://www.github.com/dasch-swiss/dsp-app/compare/v4.5.1...v4.5.2) (2021-04-22)


### Bug Fixes

* **list:** list no longer displays after deletion if it was the only list among lists ([#429](https://www.github.com/dasch-swiss/dsp-app/issues/429)) ([b05484e](https://www.github.com/dasch-swiss/dsp-app/commit/b05484ee2407ce52e2bc61f18907e5c21ff3e94c))
* **project:** bug fix in project member management (DSP-1563) ([#425](https://www.github.com/dasch-swiss/dsp-app/issues/425)) ([ac820dd](https://www.github.com/dasch-swiss/dsp-app/commit/ac820dd54637430b4bdbcebfbfa8ccdf9f4dea22))


### Maintenance

* **ontology:** disable ontology graph view (DSP-1560) ([#427](https://www.github.com/dasch-swiss/dsp-app/issues/427)) ([0a567d2](https://www.github.com/dasch-swiss/dsp-app/commit/0a567d2cfdba6a9824fe6707b3c1130877fc13d7))
* **ontology:** disable rti image class (DSP-1559) ([#430](https://www.github.com/dasch-swiss/dsp-app/issues/430)) ([48c3c76](https://www.github.com/dasch-swiss/dsp-app/commit/48c3c761d146d78f349b6ed711cffeeea6e354bb))
* **ontology:** rename boolean prop type (DSP-1561) ([#426](https://www.github.com/dasch-swiss/dsp-app/issues/426)) ([4dd23d3](https://www.github.com/dasch-swiss/dsp-app/commit/4dd23d3027af7e32b5df57d84bd8df0d8c20832c))

### [4.5.1](https://www.github.com/dasch-swiss/dsp-app/compare/v4.5.0...v4.5.1) (2021-04-20)


### Bug Fixes

* **ontology:** bug fix in create ontology process (DSP-1558) ([#423](https://www.github.com/dasch-swiss/dsp-app/issues/423)) ([bbd825b](https://www.github.com/dasch-swiss/dsp-app/commit/bbd825b659aa695b6b1ba9d58fe5a09b91071a8b))

## [4.5.0](https://www.github.com/dasch-swiss/dsp-app/compare/v4.4.3...v4.5.0) (2021-04-20)


### Bug Fixes

* **users:** update session the correct way (DSP-690) ([#419](https://www.github.com/dasch-swiss/dsp-app/issues/419)) ([3ec049e](https://www.github.com/dasch-swiss/dsp-app/commit/3ec049e76df1c66a80026f0cb1d83bfea5178319))


### Enhancements

* **project:** better error handler in case a project does not exist (DSP-1401) ([#421](https://www.github.com/dasch-swiss/dsp-app/issues/421)) ([d7470a0](https://www.github.com/dasch-swiss/dsp-app/commit/d7470a0807688ef19209f43185d6bebbe890f991))

### [4.4.3](https://www.github.com/dasch-swiss/dsp-app/compare/v4.4.2...v4.4.3) (2021-04-14)


### Bug Fixes

* **ontology:** Bug fix in ontology form ([#417](https://www.github.com/dasch-swiss/dsp-app/issues/417)) ([96dc804](https://www.github.com/dasch-swiss/dsp-app/commit/96dc8042a6dc07c50f55c2992b48f196adf0f093))

### [4.4.2](https://www.github.com/dasch-swiss/dsp-app/compare/v4.4.1...v4.4.2) (2021-04-12)


### Maintenance

* **migrate to angular11:** changes (DSP-1471) ([#415](https://www.github.com/dasch-swiss/dsp-app/issues/415)) ([3271ece](https://www.github.com/dasch-swiss/dsp-app/commit/3271ece225148d23512dc00c7f3b88ee2ff23385))

### [4.4.1](https://www.github.com/dasch-swiss/dsp-app/compare/v4.4.0...v4.4.1) (2021-04-08)


### Maintenance

* **migrate to angular10:** changes (DSP-1415) ([#412](https://www.github.com/dasch-swiss/dsp-app/issues/412)) ([cec564d](https://www.github.com/dasch-swiss/dsp-app/commit/cec564d9eb00c1e11d7fb93b3c8e94a56dc33c39))

## [4.4.0](https://www.github.com/dasch-swiss/dsp-app/compare/v4.3.1...v4.4.0) (2021-03-23)


### Bug Fixes

* **deps:** package dependency build errors (DSP-1400) ([#410](https://www.github.com/dasch-swiss/dsp-app/issues/410)) ([17e0e1a](https://www.github.com/dasch-swiss/dsp-app/commit/17e0e1ab2beefc0a9a6ca5bce0cc77c9c4196db4))


### Maintenance

* **list-editor:** new list form refactor (DSP-1392) ([#403](https://www.github.com/dasch-swiss/dsp-app/issues/403)) ([8824682](https://www.github.com/dasch-swiss/dsp-app/commit/88246828c2e0868a058ce10f3b8e80f7802ff06d))
* **ontology:** improve ontology editor design (DSP-1376) ([#401](https://www.github.com/dasch-swiss/dsp-app/issues/401)) ([6de83b8](https://www.github.com/dasch-swiss/dsp-app/commit/6de83b801b0414311112e13e90298308c6c6df79))
* **project landing page:** update metadata typings (DSP-1393) ([#407](https://www.github.com/dasch-swiss/dsp-app/issues/407)) ([b4f101b](https://www.github.com/dasch-swiss/dsp-app/commit/b4f101b0425f12919cfa071903fc788ea44aa561))
* **project metadata page:** enable error handler ([#411](https://www.github.com/dasch-swiss/dsp-app/issues/411)) ([a4004ed](https://www.github.com/dasch-swiss/dsp-app/commit/a4004eddbb22dc92a7b81c32214c0a3956fbe6ca))


### Enhancements

* **eslint:** migrate tslint to eslint (DSP-1372) ([#394](https://www.github.com/dasch-swiss/dsp-app/issues/394)) ([6ffc3b6](https://www.github.com/dasch-swiss/dsp-app/commit/6ffc3b6b8803ddf0e47a1f921ff85b7881f027d2))
* **ontology:** edit data model info (DSP-1208) ([#385](https://www.github.com/dasch-swiss/dsp-app/issues/385)) ([86a5fb8](https://www.github.com/dasch-swiss/dsp-app/commit/86a5fb819146707d8b44d5f027f2fccfb4b00791))
* **ontology:** form to create and edit property (DSP-1210) ([#406](https://www.github.com/dasch-swiss/dsp-app/issues/406)) ([91ebb68](https://www.github.com/dasch-swiss/dsp-app/commit/91ebb6845838f7370b320b805877c829904ded0e))

### [4.3.1](https://www.github.com/dasch-swiss/dsp-app/compare/v4.3.0...v4.3.1) (2021-03-03)


### Bug Fixes

* **project:** disable error handler in metadata request (DSP-1395) ([#404](https://www.github.com/dasch-swiss/dsp-app/issues/404)) ([86ebfcf](https://www.github.com/dasch-swiss/dsp-app/commit/86ebfcf6a6d62e7ddc0e45899726d24f0b1a0c4a))

## [4.3.0](https://www.github.com/dasch-swiss/dsp-app/compare/v4.2.1...v4.3.0) (2021-03-02)


### Bug Fixes

* **ontology:** set the cache earlier in case of only one ontology (DSP-1374) ([#397](https://www.github.com/dasch-swiss/dsp-app/issues/397)) ([c23ae61](https://www.github.com/dasch-swiss/dsp-app/commit/c23ae6101bb307273cf3a267248eb4ac4976b4c2))


### Enhancements

* **list-editor:** insert a child node at a specific position (DSP-1301) ([#395](https://www.github.com/dasch-swiss/dsp-app/issues/395)) ([5107200](https://www.github.com/dasch-swiss/dsp-app/commit/5107200dc769d5690f5356bb467f05143a05abd1))
* **ontology:** separate list of ontology properties (DSP-1364) ([#391](https://www.github.com/dasch-swiss/dsp-app/issues/391)) ([0f94df6](https://www.github.com/dasch-swiss/dsp-app/commit/0f94df6a32554c58e02ed863458724a6d4e0bb8c))


### Maintenance

* **deps:** bump three from 0.118.3 to 0.125.0 ([#402](https://www.github.com/dasch-swiss/dsp-app/issues/402)) ([5ab9c49](https://www.github.com/dasch-swiss/dsp-app/commit/5ab9c4904c609e77ff208adaced55ddd8f569270))
* **gh-ci:** update release please configuration (DSP-1381) ([#399](https://www.github.com/dasch-swiss/dsp-app/issues/399)) ([040df19](https://www.github.com/dasch-swiss/dsp-app/commit/040df19bad31cc4cbdf13f8253e8bde23bdf144c))
* **project landing page:** use metadata endpoint to get data from backend (DSP-1199) ([#400](https://www.github.com/dasch-swiss/dsp-app/issues/400)) ([5dde42f](https://www.github.com/dasch-swiss/dsp-app/commit/5dde42f2d5a1e2e47d5f60bc734d74200c425dea))
* **tests:** script to find ignored tests ([#396](https://www.github.com/dasch-swiss/dsp-app/issues/396)) ([9ca249d](https://www.github.com/dasch-swiss/dsp-app/commit/9ca249d35de895cd96d9bc08a82f3957f6945e8e))

### [4.2.1](https://www.github.com/dasch-swiss/dsp-app/compare/v4.2.0...v4.2.1) (2021-02-24)


### Bug Fixes

* **ontology:** bug fix in list property (DSP-1368) ([#390](https://www.github.com/dasch-swiss/dsp-app/issues/390)) ([2fb448e](https://www.github.com/dasch-swiss/dsp-app/commit/2fb448e5ae7d0a96d6e1edbd42717ea837371c20))

## [4.2.0](https://www.github.com/dasch-swiss/dsp-app/compare/v4.1.0...v4.2.0) (2021-02-22)


### Enhancements

* **list-editor:** add deletion functionality (DSP-1334) ([#378](https://www.github.com/dasch-swiss/dsp-app/issues/378)) ([34c74a6](https://www.github.com/dasch-swiss/dsp-app/commit/34c74a6474aead06f0ee822488df7d4a702385e8))
* **list-editor:** delete list root node (DSP-1356) ([#386](https://www.github.com/dasch-swiss/dsp-app/issues/386)) ([5d5eabf](https://www.github.com/dasch-swiss/dsp-app/commit/5d5eabf2521bd71a2b3055fc1f8b5b0c6ff043a5))
* **list-editor:** reposition a child node amongst its siblings (DSP-1340) ([#388](https://www.github.com/dasch-swiss/dsp-app/issues/388)) ([0a9be0e](https://www.github.com/dasch-swiss/dsp-app/commit/0a9be0ea8f73dfe72bf34bdc86c941bf7ac93c41))
* **ontology:** default language for property label ([#382](https://www.github.com/dasch-swiss/dsp-app/issues/382)) ([97230d1](https://www.github.com/dasch-swiss/dsp-app/commit/97230d1a3bba0ff27dc33674a47cfba126e19434))
* **ontology:** edit res class info (DSP-1209) ([#380](https://www.github.com/dasch-swiss/dsp-app/issues/380)) ([2debd03](https://www.github.com/dasch-swiss/dsp-app/commit/2debd036db2da4e224625ddb793133fb0fde5668))
* **ontology:** refactor list of properties in resource class (DSP-1360) ([#389](https://www.github.com/dasch-swiss/dsp-app/issues/389)) ([aa565b3](https://www.github.com/dasch-swiss/dsp-app/commit/aa565b3f5265cc0416e05282db400bfe9194836e))

## [4.1.0](https://www.github.com/dasch-swiss/dsp-app/compare/v4.0.0...v4.1.0) (2021-02-12)


### Documentation

* init mkdocs and move documentation from DSP-DOCS into DSP-APP repo (DSP-380) ([#379](https://www.github.com/dasch-swiss/dsp-app/issues/379)) ([07f5067](https://www.github.com/dasch-swiss/dsp-app/commit/07f50678c75d1da4cfc2c4792917b13840b5eaf6))


### Maintenance

* bumps DSP-JS to 1.3.0 and DSP-UI to 1.2.1 ([#374](https://www.github.com/dasch-swiss/dsp-app/issues/374)) ([7b795ee](https://www.github.com/dasch-swiss/dsp-app/commit/7b795ee56026fa3a9e2f44e9c43a4d3502b5d764))
* **deps:** bump socket.io from 2.3.0 to 2.4.1 ([#367](https://www.github.com/dasch-swiss/dsp-app/issues/367)) ([8133d87](https://www.github.com/dasch-swiss/dsp-app/commit/8133d876bb4f606293604a4a63111fddd8993e1a))


### Enhancements

* **list editor:** Adds support for editing lists (DSP-741) ([#365](https://www.github.com/dasch-swiss/dsp-app/issues/365)) ([5b6ee4b](https://www.github.com/dasch-swiss/dsp-app/commit/5b6ee4be19b1b900fcb58a789d1e2cff44cb79e6))
* **ontology:** update cardinality in resource class (DSP-1266) ([#377](https://www.github.com/dasch-swiss/dsp-app/issues/377)) ([5a766c1](https://www.github.com/dasch-swiss/dsp-app/commit/5a766c1db06d862b2edfba49347a659f4233d1c2))

## [4.0.0](https://www.github.com/dasch-swiss/dsp-app/compare/v3.0.0...v4.0.0) (2021-01-28)


### ⚠ BREAKING CHANGES

* set up the login page as a starting page (DSP-1292) (#370)
* **app+main:** comment out the search and everything related to resources (DSP-1291) (#371)

### Bug Fixes

* **dialog:** Diaolog box height issue fixed ([#358](https://www.github.com/dasch-swiss/dsp-app/issues/358)) ([15d1182](https://www.github.com/dasch-swiss/dsp-app/commit/15d11820ef7a3b063f2f706d9bfce7e51c9ea514))
* **routing:** bring back the route handler in main component (DSP-1303) ([#373](https://www.github.com/dasch-swiss/dsp-app/issues/373)) ([8492c1a](https://www.github.com/dasch-swiss/dsp-app/commit/8492c1acd23da73ed143e160388eb0080ff60b17))


### Maintenance

* update pr template (DSP-1189) ([#353](https://www.github.com/dasch-swiss/dsp-app/issues/353)) ([f348e70](https://www.github.com/dasch-swiss/dsp-app/commit/f348e70c4fa4dc0aeb2573aba4e1aa62fc1725a6))
* update the dsp-ui and dsp-js versions to the latest ([#364](https://www.github.com/dasch-swiss/dsp-app/issues/364)) ([66931f0](https://www.github.com/dasch-swiss/dsp-app/commit/66931f088d4a9ad07da219c4a6e8e81d39f4596e))


### Enhancements

* display metadata on project landing page (DSP-1065) ([#348](https://www.github.com/dasch-swiss/dsp-app/issues/348)) ([3012ef5](https://www.github.com/dasch-swiss/dsp-app/commit/3012ef5e767dea3a16c7ae380bf3f1a4b3385c9e))
* **error:** Server error handler (DSP-710) ([#355](https://www.github.com/dasch-swiss/dsp-app/issues/355)) ([d5b77bf](https://www.github.com/dasch-swiss/dsp-app/commit/d5b77bf89470d5bb63b7850ce1b98dbc02d87223))
* **new-resource-form:** make visible the required prop fields (DSP-1115) ([#342](https://www.github.com/dasch-swiss/dsp-app/issues/342)) ([5885b04](https://www.github.com/dasch-swiss/dsp-app/commit/5885b041c2c7c223277a50ccc0495872b1d099fe))
* **project landing page:** add copy to clipboard functionality (DSP-1248) ([#368](https://www.github.com/dasch-swiss/dsp-app/issues/368)) ([17bf71c](https://www.github.com/dasch-swiss/dsp-app/commit/17bf71c4502074264070bd513301139c43976a58))
* **select-resource-class:** allow accented character (DSP-1241) ([#363](https://www.github.com/dasch-swiss/dsp-app/issues/363)) ([8a2654b](https://www.github.com/dasch-swiss/dsp-app/commit/8a2654b75f3194292b2fada9239c29ffa44fe8db))


### refactor

* **app+main:** comment out the search and everything related to resources (DSP-1291) ([#371](https://www.github.com/dasch-swiss/dsp-app/issues/371)) ([50b1309](https://www.github.com/dasch-swiss/dsp-app/commit/50b13091e6437a68ea2a45bb7b50a4e655f5d85d))
* set up the login page as a starting page (DSP-1292) ([#370](https://www.github.com/dasch-swiss/dsp-app/issues/370)) ([46dfdbb](https://www.github.com/dasch-swiss/dsp-app/commit/46dfdbba13adff1dc40eb5bb8422a3093b1e8b74))

## [3.0.0](https://www.github.com/dasch-swiss/dsp-app/compare/v2.0.1...v3.0.0) (2020-12-18)


### ⚠ BREAKING CHANGES

* Prepare next big release (#350)

### Bug Fixes

* **header:** Replace search-panel with fulltext-search ([#313](https://www.github.com/dasch-swiss/dsp-app/issues/313)) ([d234fa7](https://www.github.com/dasch-swiss/dsp-app/commit/d234fa7be480f0769474c39ae39169d2ad3d4c4f))
* **node_modules:** Update dependencies ([#318](https://www.github.com/dasch-swiss/dsp-app/issues/318)) ([f85e4a2](https://www.github.com/dasch-swiss/dsp-app/commit/f85e4a2a0c727c7b44f5659b05d11d139fb26236))
* **project:** Bug fix in project view when not logged-in ([#339](https://www.github.com/dasch-swiss/dsp-app/issues/339)) ([ce5acf1](https://www.github.com/dasch-swiss/dsp-app/commit/ce5acf11b28309674e75fdaf15ead60dbb4bcc96))
* **workspace:** Fix broken link ([#306](https://www.github.com/dasch-swiss/dsp-app/issues/306)) ([52b324d](https://www.github.com/dasch-swiss/dsp-app/commit/52b324db05a6fb62675e43733b1f5bc19f99f29f))
* Open external link in new tab ([#297](https://www.github.com/dasch-swiss/dsp-app/issues/297)) ([99f188e](https://www.github.com/dasch-swiss/dsp-app/commit/99f188ece067d509e6f177e259bbb97b2d49983a))
* Replaced reset buttons with cancel button ([#284](https://www.github.com/dasch-swiss/dsp-app/issues/284)) ([1481018](https://www.github.com/dasch-swiss/dsp-app/commit/14810180c63cf3a44f1f3950105ffb87db335c02))
* Update docker environment ([#294](https://www.github.com/dasch-swiss/dsp-app/issues/294)) ([db6d277](https://www.github.com/dasch-swiss/dsp-app/commit/db6d277cdf5bbb5372a63e64eeb7b53684338eff))


### Documentation

* Update README ([#292](https://www.github.com/dasch-swiss/dsp-app/issues/292)) ([fa72ee1](https://www.github.com/dasch-swiss/dsp-app/commit/fa72ee1efc3da54c7f04f23ddd6c7513a607cc53))


### Enhancements

* Prepare next big release ([#350](https://www.github.com/dasch-swiss/dsp-app/issues/350)) ([6a39180](https://www.github.com/dasch-swiss/dsp-app/commit/6a391800c09684ae79b9a88dc31a6f1f75c54716))
* **header:** display form link when the session is active ([#332](https://www.github.com/dasch-swiss/dsp-app/issues/332)) ([d609bd5](https://www.github.com/dasch-swiss/dsp-app/commit/d609bd506e08fe86a84af74b6c7fcaf7362fde84))
* **header+dialog:** create button in the header + dialog box ([#320](https://www.github.com/dasch-swiss/dsp-app/issues/320)) ([5e4890d](https://www.github.com/dasch-swiss/dsp-app/commit/5e4890d55f1b2e8d9cff030ea2481344ac004e6f))
* **PR:** Add template for PRs ([#305](https://www.github.com/dasch-swiss/dsp-app/issues/305)) ([1468ee1](https://www.github.com/dasch-swiss/dsp-app/commit/1468ee1daec724ece8c84e96b3a53854577a16d9))


### Maintenance

* **ci:** Update package-name in gh actions workflow ([#352](https://www.github.com/dasch-swiss/dsp-app/issues/352)) ([3d9bb13](https://www.github.com/dasch-swiss/dsp-app/commit/3d9bb13b6a0fd8ab9a57d1e11e6ce77be7ae2433))
* Update js- and ui-lib version ([#293](https://www.github.com/dasch-swiss/dsp-app/issues/293)) ([5409d9b](https://www.github.com/dasch-swiss/dsp-app/commit/5409d9bdb2f72b2f269ba0a7ba039d3cbcae472b))
