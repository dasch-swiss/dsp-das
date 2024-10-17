import { faker } from '@faker-js/faker';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { UploadedFileResponse } from '../../../../../libs/vre/shared/app-representations/src';
import { Project0001ResourcePayloads } from '../../fixtures/project0001-resource-payloads';
import { Project0803ResourcePayloads } from '../../fixtures/project0803-resource-payloads';
import { AudioThingClass, MiscClass, SidebandClass, VideoThingClass } from '../../models/existing-data-models';
import { Project0001Page, Project0803Page } from '../../support/pages/existing-ontology-class-page';

describe('View Existing Resource', () => {
  const onecolor = require('onecolor');

  let project0803Page: Project0803Page;
  let project0001Page: Project0001Page;

  const miscData: MiscClass = {
    label: faker.lorem.word(),
    color: faker.color.rgb(),
    colorComment: faker.lorem.sentence(),
    book: '',
    bookComment: faker.lorem.sentence(),
  };

  const sidebandData: SidebandClass = {
    label: faker.lorem.word(),
    file: '',
    title: faker.lorem.sentence(),
    titleComment: faker.lorem.sentence(),
    description: faker.lorem.sentence(),
    descriptionComment: faker.lorem.sentence(),
    comments: [{ text: faker.lorem.sentence(), comment: faker.lorem.sentence() }],
  };

  const videoThingData: VideoThingClass = createVideoThingClass('zzLabel');

  function createVideoThingClass(label: string): VideoThingClass {
    return {
      label: label,
      file: '6dxOL1bLhWv-YhnMtV6T8HK.mp4',
      title: faker.lorem.sentence(),
      titleComment: faker.lorem.sentence(),
    };
  }

  const audioThingData: AudioThingClass = {
    label: faker.lorem.word(),
    file: '5FciLKcyvaa-lfSH3y9bHzI.mp3',
    title: faker.lorem.sentence(),
    titleComment: faker.lorem.sentence(),
  };

  const uploadedImageFilePath = '/uploads/Fingerprint_Logo_coloured.png';
  const fullUploadedImageFilePath = `cypress/${uploadedImageFilePath}`;
  const uploadedVideoFilePath = '/uploads/dasch-short.mp4';
  const uploadedAudioFilePath = '/uploads/dasch-short.mp3';

  const screenshotPath = 'screenshots/osd-canvas-screenshot.png';

  beforeEach(() => {
    project0803Page = new Project0803Page();
    project0001Page = new Project0001Page();

    cy.loginAdmin().then(() => {
      cy.uploadFile(`../${uploadedImageFilePath}`, Project0803Page.projectShortCode).then(response => {
        sidebandData.file = (response as UploadedFileResponse).internalFilename;
        cy.createResource(Project0803ResourcePayloads.sideband(sidebandData));
      });
      cy.uploadFile(`../${uploadedVideoFilePath}`, Project0001Page.projectShortCode).then(response => {
        videoThingData.file = (response as UploadedFileResponse).internalFilename;
        cy.createResource(Project0001ResourcePayloads.videoThing(videoThingData));
      });
      cy.uploadFile(`../${uploadedVideoFilePath}`, Project0001Page.projectShortCode).then(response => {
        const videoThingData2 = createVideoThingClass(faker.lorem.word());
        videoThingData2.file = (response as UploadedFileResponse).internalFilename;
        cy.createResource(Project0001ResourcePayloads.videoThing(videoThingData2));
      });
      cy.uploadFile(`../${uploadedAudioFilePath}`, Project0001Page.projectShortCode).then(response => {
        audioThingData.file = (response as UploadedFileResponse).internalFilename;
        cy.createResource(Project0001ResourcePayloads.audioThing(audioThingData));
      });
    });
    cy.createResource(Project0803ResourcePayloads.misc(miscData));
    cy.logout();
  });

  it('should not be accessible and return to page', () => {
    cy.visit('/project/0803/ontology/incunabula/book/add');
    const regex = new RegExp('/project/0803$');
    cy.url().should('match', regex);
  });

  it('object without representation with label, color, comment properties should be present', () => {
    project0803Page.visitClass('misc');
    cy.get('[data-cy=resource-list-item]').should('have.length.greaterThan', 0);
    cy.get('[data-cy=resource-list-item] h3.res-class-value').contains(miscData.label).click();
    cy.get('[data-cy=resource-header-label]').contains(miscData.label);
    cy.get('[data-cy=representation-container]').should('not.exist');
    cy.get('[data-cy=color-box]')
      .should('have.css', 'background-color')
      .should('contain', onecolor(miscData.color).css().replaceAll(',', ', '));
    cy.get('[data-cy=show-all-comments]').scrollIntoView().click();
    cy.get('[data-cy=property-value-comment]').contains(miscData.colorComment);
  });

  it('Sideband resource with still image, rich text and comments should be present', () => {
    project0803Page.visitClass('Sideband');
    cy.get('[data-cy=accept-cookies]').click();
    cy.intercept('GET', '**/default.jpg').as('stillImageRequest');
    cy.get('[data-cy=resource-list-item] h3.res-class-value').contains(sidebandData.label).click();
    cy.get('[data-cy=resource-header-label]').contains(sidebandData.label);
    cy.get('.representation-container').should('exist');
    cy.get('app-still-image').should('be.visible');
    cy.wait('@stillImageRequest').its('request.url').should('include', sidebandData.file);
    cy.wait('@stillImageRequest').its('response.statusCode').should('eq', 200);

    cy.getCanvas('app-still-image canvas').screenshot('osd-canvas-screenshot', {
      clip: { x: 0, y: 156, width: 300, height: 100 },
    });
    cy.fixture(screenshotPath, 'base64').then(expectedImageBase64 => {
      const expectedImageBuffer = Buffer.from(expectedImageBase64, 'base64');
      const expectedImg = PNG.sync.read(expectedImageBuffer);
      cy.readFile(fullUploadedImageFilePath, 'base64').then(binary => {
        expect(binary).to.exist;
        const imageBuffer = Cypress.Buffer.from(binary, 'base64');
        const pngImage = PNG.sync.read(imageBuffer);
        expect(pngImage).to.exist;
        expect(pngImage.width).to.be.greaterThan(0);
        expect(pngImage.height).to.be.greaterThan(0);
        const { width, height } = expectedImg;
        const diff = new PNG({ width, height });
        const pixelDiff = pixelmatch(expectedImg.data, pngImage.data, diff.data, width, height, {
          threshold: 0.1,
        });
        expect(pixelDiff).to.be.lessThan(100);
      });
    });

    cy.get('[data-cy=property-value]').contains(sidebandData.title);
    cy.get('[data-cy=show-all-comments]').scrollIntoView().click();
    cy.get('[data-cy=property-value-comment]').should('have.length.greaterThan', 0);
    cy.get('[data-cy=property-value-comment]').contains(sidebandData.titleComment).scrollIntoView();
    cy.get('[data-cy=rich-text-switch] p').contains(sidebandData.comments[0].text);
    cy.get('[data-cy=property-value-comment]').contains(sidebandData.comments[0].comment);
  });

  it('moving image representation should be present', () => {
    let interceptCall = 1;
    cy.intercept('GET', '**/file', req => {
      req.alias = `call${interceptCall++}`;
      req.continue();
    });
    project0001Page.visitClass('VideoThing');
    cy.wait('@call1').should(interception => {
      expect(interception.response?.statusCode).to.be.equal(206);
    });

    cy.get('[data-cy=accept-cookies]').click();
    cy.get('rn-banner').shadow().find('.rn-close-btn').click();

    cy.get('[data-cy=resource-list-item] h3.res-class-value').contains(videoThingData.label).click();
    cy.get('[data-cy=resource-header-label]').contains(videoThingData.label);
    cy.get('.representation-container').should('exist');
    cy.get('app-video').should('be.visible');

    // wait for selected resource file request to be intercepted
    cy.wait('@call2').should(interception => {
      expect(interception.request.url).to.include(videoThingData.file);
      expect(interception.response?.statusCode).to.be.equal(206);
    });
    cy.get('[data-cy=side-panel-collapse-btn]').click();
    cy.get('[data-cy=player-time]').contains('00:00');
    cy.get('[data-cy=play-pause-button]').contains('play_arrow');
    cy.get('[data-cy=play-pause-button]').click();
    cy.get('[data-cy=play-pause-button]').contains('pause');
    cy.wait(1000); //allow to play for 1 second
    cy.get('[data-cy=play-pause-button]').click();
    cy.get('[data-cy=player-time]')
      .invoke('text')
      .then(text => {
        cy.log('player time:', text);
        expect(text).to.include('00:01');
      });
    cy.get('[data-cy=play-pause-button]').contains('play_arrow');
    cy.get('[data-cy=go-to-start-button]').click();
    cy.get('[data-cy=player-time]').contains('00:00');
    cy.get('[data-cy=cinema-mode-button]').contains('fullscreen');
    cy.get('[data-cy=cinema-mode-button]').click();
    cy.get('[data-cy=cinema-mode-button]').contains('fullscreen_exit');
    cy.get('[data-cy=cinema-mode-button]').click();

    cy.get('[data-cy=property-value]').contains(videoThingData.title);
    cy.get('[data-cy=show-all-comments]').scrollIntoView().click();
    cy.get('[data-cy=property-value-comment]').should('have.length.greaterThan', 0);
    cy.get('[data-cy=property-value-comment]').contains(videoThingData.titleComment).scrollIntoView();
  });

  it('audio representation should be present', () => {
    cy.intercept('GET', '**/file').as('audioFileRequest');
    project0001Page.visitClass('AudioThing');

    cy.get('[data-cy=accept-cookies]').click();
    cy.get('rn-banner').shadow().find('.rn-close-btn').click();

    cy.get('[data-cy=resource-list-item] h3.res-class-value').contains(audioThingData.label).click();
    cy.get('[data-cy=resource-header-label]').contains(audioThingData.label);
    cy.get('.representation-container').should('exist');
    cy.get('app-audio').should('be.visible');

    cy.get('[data-cy=side-panel-collapse-btn]').click();
    cy.get('[data-cy=player-time]').contains('00:00');
    cy.intercept('GET', '**/file').as('audioFileRequest');
    cy.get('[data-cy=play-pause-button]').contains('play_arrow');
    cy.get('[data-cy=play-pause-button]').click();
    cy.wait('@audioFileRequest').then(xhr => {
      expect(xhr.request.url).to.include(audioThingData.file);
      expect(xhr.response.statusCode).to.eq(206);
    });
    cy.get('[data-cy=play-pause-button]').contains('pause');
    cy.wait(1000); //allow to play for 1 second
    cy.get('[data-cy=play-pause-button]').click();
    cy.get('[data-cy=player-time]')
      .invoke('text')
      .then(text => {
        cy.log('player time:', text);
        expect(text).to.include('00:01');
      });
    cy.get('[data-cy=play-pause-button]').contains('play_arrow');
    cy.get('[data-cy=go-to-start-button]').click();
    cy.get('[data-cy=player-time]').contains('00:00');

    cy.get('[data-cy=property-value]').contains(audioThingData.title);
    cy.get('[data-cy=show-all-comments]').scrollIntoView().click();
    cy.get('[data-cy=property-value-comment]').should('have.length.greaterThan', 0);
    cy.get('[data-cy=property-value-comment]').contains(audioThingData.titleComment).scrollIntoView();
  });
});
