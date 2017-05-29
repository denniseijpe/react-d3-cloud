import { Component, PropTypes } from 'react';
import ReactFauxDom from 'react-faux-dom';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

import {
  defaultFontSizeMapper,
} from './defaultMappers';


const fill = d3.scaleOrdinal(d3.schemeCategory10);


class WordCloud extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
      text: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })).isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    padding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.func,
    ]),
    font: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    fontSizeMapper: PropTypes.func,
    rotate: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.func,
    ]),
  }

  static defaultProps = {
    width: 700,
    height: 600,
    padding: 5,
    font: 'serif',
    fontSizeMapper: defaultFontSizeMapper,
    rotate: 0,
  }

  componentWillMount() {
    this.wordCloud = ReactFauxDom.createElement('div');
  }

  render() {
    const { data, width, height, padding, font, fontSizeMapper, rotate } = this.props;
    const wordCounts = data.map(
      text => ({ ...text })
    );

    // clear old words
    d3.select(this.wordCloud).selectAll('*').remove();

    // render based on new data
    const layout = cloud()
      .size([width, height])
      .font(font)
      .words(wordCounts)
      .padding(padding)
      .rotate(rotate)
      .fontSize(fontSizeMapper)
      .on('end', (words, e) => {
        window.wlen = words.length;
        let sc = e ? Math.min(width / Math.abs(e[1].x - width / 2), width / Math.abs(e[0].x - width / 2), height / Math.abs(e[1].y - height / 2), height / Math.abs(e[0].y - height / 2)) / 2 : 1;

        const newWords = []

        for (var i = 0; i < words.length; i++) {
          if (words[i].company) {
            newWords.push({
              ...words[i],
              'id': words[i].id + 'czz',
              'text': words[i].company,
              'y': words[i].y + words[i].size / 1.6,
              'size': words[i].size - 5,
            })
          }
          newWords.push({...words[i]})
        }

        d3.select(this.wordCloud)
          .append('svg')
          .attr('width', layout.size()[0])
          .attr('height', layout.size()[1])
          .append('g')
          .attr('transform', `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})scale(${sc})`)
          .selectAll('text')
          .data(newWords)
          .enter()
          .append('text')
            .style('font-size', d => `${d.size}px`)
            .style('font-family', font)
            .style('fill', (d, i) => fill(i))
            .attr('text-anchor', 'middle')
            .style('transform',
              d => `translate(${d.x}px, ${d.y}px)`
            )
            .attr('transform',
              d => `translate(${[d.x, d.y]})`
            )
            .attr('key', d => d.id)
            .text(d => d.text);
      });

    layout.start();

    return this.wordCloud.toReact();
  }
}


export default WordCloud;
