export class InputMasks {
  public static wholeNumberInputMask(numbersCount: number) {
    return {
      mask: Array.from(new Array(numbersCount), () => new RegExp('\\d')),
      showMask: false,
      guide: true,
      placeholderChar: ' ',
      keepCharPositions: true,
    };
  }
}
