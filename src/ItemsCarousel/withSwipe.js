import React from 'react';
import {calculateItemWidth} from './helpers';

const getFirstTouchClientX = (touches, defaultValue = 0) => {
  if (touches && touches.length > 0) {
    return touches[0].clientX;
  }
  return defaultValue;
};

function captureClick(e) {
  e.stopPropagation(); // Stop the click from being propagated.
  window.removeEventListener('click', captureClick, true); // cleanup
}

export default () => (Cpmt) => {
  return class WithSwipe extends React.Component {
    state = {
      startTouchX: null,
      currentTouchX: null,
    };

    start = clientX => {
      this.setState({
        startTouchX: clientX,
        currentTouchX: clientX
      });
    }

    onWrapperTouchStart = e => {
      this.start(getFirstTouchClientX(e.touches));
    };

    onWrapperMouseDown = e => {
      this.start(e.clientX);
    };

    // Returns true if a swipe happened.
    end = clientX => {
      if (this.state.startTouchX === null) {
        return;
      }

      const {
        containerWidth,
        gutter,
        numberOfCards,
        firstAndLastGutter,
        showSlither,
        requestToChangeActive,
        activeItemIndex,
      } = this.props;

      const itemWidth = calculateItemWidth({
        containerWidth,
        gutter,
        numberOfCards,
        firstAndLastGutter,
        showSlither,
      });

      const touchRelativeX = this.state.startTouchX - clientX;

      // When the user swipes to 0.25 of the next item
      const threshold = 0.25;

      const noOfItemsToSwipe = Math.floor(Math.abs(touchRelativeX)/(itemWidth + gutter/2) + (1 - threshold));

      this.setState({ startTouchX: null, currentTouchX: null });

      if (noOfItemsToSwipe > 0) {
        requestToChangeActive(
          touchRelativeX < 0 ? activeItemIndex - noOfItemsToSwipe : activeItemIndex + noOfItemsToSwipe
        );
        return true;
      }

      return false;
    };

    onWrapperTouchEnd = e => {
      this.end(getFirstTouchClientX(e.changedTouches));
    };

    onWrapperMouseUp = e => {
      if (this.end(e.clientX)) {
        // See https://stackoverflow.com/a/20290312
        // Prevent the next onclick from firing since we did a drag.
        window.addEventListener('click', captureClick, true);
      }
    };

    move = clientX => {
      this.setState({ currentTouchX: clientX });
    }

    onWrapperTouchMove = e => {
      this.move(getFirstTouchClientX(e.touches));
    };

    onWrapperMouseMove = e => {
      if (this.state.startTouchX === null) {
        return;
      }
      this.move(e.clientX);
    }

    render() {
      const {
        disableSwipe,
        isPlaceholderMode,
      } = this.props;

      const {
        startTouchX,
        currentTouchX,
      } = this.state;

      if (disableSwipe || isPlaceholderMode) {
        return (
          <Cpmt {...this.props} touchRelativeX={0} />
        );
      }

      return (
        <Cpmt
          {...this.props}
          onWrapperTouchStart={this.onWrapperTouchStart}
          onWrapperTouchEnd={this.onWrapperTouchEnd}
          onWrapperTouchMove={this.onWrapperTouchMove}
          onWrapperMouseDown={this.onWrapperMouseDown}
          onWrapperMouseUp={this.onWrapperMouseUp}
          onWrapperMouseMove={this.onWrapperMouseMove}
          touchRelativeX={startTouchX - currentTouchX}
        />
      )
    }
  }
}