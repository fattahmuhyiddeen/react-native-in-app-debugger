import React from 'react';
import Text from './Text';

export default ({ text, filter, style = {} }) => {
    if (!filter || !/^[a-zA-Z0-9./]+$/.test(filter)) return <Text style={style}>{text}</Text>;
    const indices = text ? [...text.matchAll(new RegExp(filter, 'gi'))].map((a) => a.index) : [];
    if (!indices.length) return <Text style={style}>{text}</Text>;
    return (
      <>
        {indices.map((i, ii) => {
          const preText = !ii ? text.slice(0, i) : text.slice(indices[ii - 1] + filter.length, i);
          const searchText = text.slice(i, i + filter.length);
          const seqText = !indices[ii + 1] ? text.slice(i + filter.length) : '';
          return (
            <React.Fragment key={i+ii}>
              {preText}
              <Text style={{ backgroundColor: 'yellow', color: 'black', ...style }}>{searchText}</Text>
              {seqText}
            </React.Fragment>
          );
        })}
      </>
    );
  };