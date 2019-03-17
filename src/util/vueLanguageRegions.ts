import { TextDocument as VLTTextDocument, Range as VLTRange } from 'vscode-languageserver-types';
import { getDocumentRegions, LanguageRange } from 'vue-language-server/dist/modes/embeddedSupport';

export default function getVueLanguageRegions(text: string) {
  const VLTdoc = VLTTextDocument.create('test://test/test.vue', 'vue', 0, text);
  const startPos = VLTdoc.positionAt(0);
  const endPos = VLTdoc.positionAt(VLTdoc.getText().length);
  const regionsClosure = getDocumentRegions(VLTdoc);
  const allRegions = regionsClosure.getLanguageRanges(VLTRange.create(startPos, endPos));

  const getAllStyleRegions = () => {
    const regions: LanguageRange[] = [];
    for (const c of allRegions) {
      if (/^(css|sass|scss|less|postcss|stylus)$/.test(c.languageId)) {
        regions.push(c);
      }
    }
    return regions;
  };

  return {
    ...regionsClosure,
    getAllStyleRegions
  }
}
