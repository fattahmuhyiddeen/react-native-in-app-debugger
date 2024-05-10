import React from 'react';
import Text from './Text';

export default ({ text, filter }) => {
    if (!filter || !/^[a-zA-Z0-9./]+$/.test(filter)) return text;
    const indices = [...text.matchAll(new RegExp(filter, 'gi'))].map((a) => a.index);
    if (!indices.length) return text;
    return (
      <>
        {indices.map((i, ii) => {
          const preText = !ii ? text.slice(0, i) : text.slice(indices[ii - 1] + filter.length, i);
          const searchText = text.slice(i, i + filter.length);
          const seqText = !indices[ii + 1] ? text.slice(i + filter.length) : '';
          return (
            <>
              {preText}
              <Text style={{ backgroundColor: 'yellow', color: 'black' }}>{searchText}</Text>
              {seqText}
            </>
          );
        })}
      </>
    );
  };