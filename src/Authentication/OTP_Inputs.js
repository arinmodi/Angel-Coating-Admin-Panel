import React from 'react';
import { StyleSheet } from 'react-native';
import { Content, Item, Input } from 'native-base';
import { Grid, Col } from 'react-native-easy-grid';
import { widthPercentageToDP, heightPercentageToDP as hp } from 'react-native-responsive-screen';

class OtpInputs extends React.Component {
    state={otp:[],autootp : ''};
    otpTextInput = [];

    componentDidMount() {
        this.otpTextInput[0]._root.focus();
    }

    renderInputs() {
        const inputs = Array(6).fill(0);
        const txt = inputs.map(
            (i, j) => <Col key={j} style={styles.txtMargin}><Item regular style = {{overflow : 'hidden',borderWidth : 1,borderColor : 'black',borderRadius : widthPercentageToDP('2%')}}>
                <Input
                    style={styles.inputRadius}
                    keyboardType="numeric"
                    onChangeText={v => this.focusNext(j, v)}
                    onKeyPress={e => this.focusPrevious(e.nativeEvent.key, j)}
                    ref={ref => this.otpTextInput[j] = ref}
                    maxLength = {1}
                    defaultValue = {this.props.autofill === true ? this.props.setotp(j) : ''}
                />
            </Item></Col>
        );
        return txt;
    }

    

    focusPrevious(key, index) {
        if (key === 'Backspace' && index !== 0){
            this.otpTextInput[index - 1]._root.focus();
        }
    }

    focusNext(index, value) {
        if (index < this.otpTextInput.length - 1 && value) {
            this.otpTextInput[index + 1]._root.focus();
        }
        if (index === this.otpTextInput.length - 1) {
            this.otpTextInput[index]._root.blur();
        }
        const otp = this.state.otp;
        otp[index] = value;
        this.setState({ otp });
        this.props.getOtp(otp.join(''));
    }


    render() {

        return (
            <Content padder>
                <Grid style={styles.gridPad}>
                    {this.renderInputs()}
                </Grid>
            </Content>
        );
    }
}

const styles = StyleSheet.create({
    gridPad: { padding: widthPercentageToDP('8%')},
    txtMargin: { margin: widthPercentageToDP('1.5%') },
    inputRadius: { textAlign: 'center',backgroundColor : '#F5F6FB', },
});

export default OtpInputs;