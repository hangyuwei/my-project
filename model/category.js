import { ensureArray, ensureObject, pickFirst, toString } from './adaptUtils';

export function getCategoryList() {
  return [
    {
      groupId: '24948',
      name: '食品保健类',
      thumbnail: 'https://tdesign.gtimg.com/miniprogram/template/retail/category/category-default.png',
      children: [],
    },
  ];
}


export function adaptCategoryList(realList = []) {
  const list = Array.isArray(realList)
    ? realList
    : ensureArray(realList?.list || realList?.items || realList?.data?.list);
  if (list.length && list[0]?.groupId) return list;
  if (!list.length) return getCategoryList();
  return list.map((item, index) => {
    const source = ensureObject(item);
    return {
      groupId: toString(pickFirst(source.mockId, source.id, source.groupId, index)),
      name: pickFirst(source.name, source.title, ''),
      thumbnail: pickFirst(source.thumbnail, source.image, ''),
      children: ensureArray(source.children).map((child, childIndex) => ({
        groupId: toString(pickFirst(child?.id, child?.groupId, `${index}-${childIndex}`)),
        name: pickFirst(child?.name, child?.title, ''),
        thumbnail: pickFirst(child?.thumbnail, child?.image, ''),
        children: ensureArray(child?.children),
      })),
    };
  });
}
