// @flow

import React from 'react';
import {
  View,
} from 'react-native';

import BlockQuote from './components/BlockQuote';
import DraftJsText from './components/DraftJsText';
import UnorderedListItem from './components/UnorderedListItem';
import OrderedListItem from './components/OrderedListItem';
import AtomicView from './components/AtomicView';
import generateKey from './utils/generateKey';

const getBlocks = (
  bodyData: Object = {},
  customStyles: Object = {},
  atomicHandler: Function,
  navigate?: Function,
  orderedListSeparator?: String): any => {
  if (!bodyData.blocks) {
    return null;
  }

  const counters = {
    'unordered-list-item': {
      count: 0,
      type: 'unordered-list-item',
    },
    'ordered-list-item': {
      count: 0,
      type: 'ordered-list-item',
    },
  };

  function ViewAfterList(): any {
    return <View style={customStyles.viewAfterList} />;
  }

  function checkCounter(counter: Object): any {
    const myCounter = counter;

    if (myCounter.count >= 0) {
      if (myCounter.count > 0) {
        myCounter.count = 0;
        return <ViewAfterList />;
      }
      return null;
    }

    if (myCounter['unordered-list-item'].count > 0 || myCounter['ordered-list-item'].count > 0) {
      myCounter['unordered-list-item'].count = 0;
      myCounter['ordered-list-item'].count = 0;
      return <ViewAfterList />;
    }

    return null;
  }

  return bodyData.blocks
    .map((item: Object): any => {
      const itemData = {
        key: item.key,
        text: item.text,
        type: item.type,
        inlineStyles: item.inlineStyleRanges,
        entityRanges: item.entityRanges,
        data: item.data
      };

      switch (item.type) {
        case 'unstyled': {
          if (itemData.text.length === 0) {
            return null
          } else {
            const viewBefore = checkCounter(counters);
            let styleFromData = {}
            const transforms = {
              left: 'flex-start',
              right: 'flex-end',
              center: 'center'
            }
            if (itemData.data["text-align"]) {
              styleFromData = {
                alignItems: transforms[itemData.data["text-align"]]
              }
            }
            return (
              <View key={generateKey()} style={styleFromData}>
                {viewBefore}
                <DraftJsText
                  {...itemData}
                  entityMap={bodyData.entityMap}
                  customStyles={customStyles}
                  navigate={navigate}
                />
              </View>
            )
          }
        }
        case 'paragraph':
        case 'header-one':
        case 'header-two':
        case 'header-three':
        case 'header-four':
        case 'header-five':
        case 'header-six':
        case 'code-block': {
          const viewBefore = checkCounter(counters);
          return (
            <View key={generateKey()}>
              {viewBefore}
              <DraftJsText
                {...itemData}
                entityMap={bodyData.entityMap}
                customStyles={customStyles}
                navigate={navigate}
              />
            </View>
          );
        }

        case 'atomic': {
          // const atomicView = [];
          // atomicView.push(checkCounter(counters));
          // atomicView.push(atomicHandler(item));
          // return atomicView;
          return (
            <View key={generateKey()} style={{justifyContent: 'center', alignItems: 'center'}}>
              <AtomicView
                {...itemData}
                entityMap={bodyData.entityMap}
                customStyles={customStyles}
                navigate={navigate}
                atomicHandler={atomicHandler}
              />
            </View>
          )
        }

        case 'blockquote': {
          const viewBefore = checkCounter(counters);
          return (
            <View key={generateKey()}>
              {viewBefore}
              <BlockQuote
                {...itemData}
                entityMap={bodyData.entityMap}
                customStyles={customStyles}
                navigate={navigate}
              />
            </View>
          );
        }

        case 'unordered-list-item': {
          counters[item.type].count += 1;
          const viewBefore = checkCounter(counters['ordered-list-item']);
          return (
            <View key={generateKey()}>
              {viewBefore}
              <UnorderedListItem
                {...itemData}
                entityMap={bodyData.entityMap}
                customStyles={customStyles}
                navigate={navigate}
              />
            </View>
          );
        }

        case 'ordered-list-item': {
          counters[item.type].count += 1;
          const viewBefore = checkCounter(counters['unordered-list-item']);
          return (
            <View key={generateKey()}>
              {viewBefore}
              <OrderedListItem
                {...itemData}
                separator={orderedListSeparator}
                counter={counters[item.type].count}
                entityMap={bodyData.entityMap}
                customStyles={customStyles}
                navigate={navigate}
              />
            </View>
          );
        }

        default: {
          const viewBefore = checkCounter(counters);
          return (
            <View key={generateKey()}>
              {viewBefore}
            </View>
          );
        }
      }
    });
};

module.exports = getBlocks;
