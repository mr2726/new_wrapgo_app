import {View,Text, StyleSheet, ScrollView} from 'react-native';
import React from 'react';
import {colors} from '../../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// COMPONENTS
import BottomSheet from '../ui/BottomSheet';
import {Button_} from '../ui/buttons';
// ----------------------------------------------------------

// ICONS
import {Wraping, Join, Task, Earn, Payment, Progress} from '../Icons';
// ----------------------------------------------------------

export default function HowItWorks() {
    const [state, setState] = React.useState(0) // 0 = first step, 1 = second step, 2 = third step ...

    const stepContent = [
        {
            "setp" : 0,
            "title" : "Get your car wrapped",
            "description" : "After you apply, we install branded advertising on your car completely free.",
            "image" : <Wraping width={139} height={139} color={colors.icons}/>,
            "imageDescription" : "No upfront costs. The wrap is safe for your vehicle. Once wrapped, you are ready to earn in Yerevan. Weekly photo verification required.",
            buttonTitle: "Next"
        },
        {
            "setp" : 1,
            "title" : "Join campaigns",
            "description" : "Brands launch campaigns through WrapGo. You have 4 hours to accept an offer before it expires.",
            "image" : <Join width={139} height={139} color={colors.icons}/>,
            "imageDescription" : "No upfront costs. The wrap is safe for your vehicle. Once wrapped, you are ready to earn in Yerevan. Weekly photo verification required.",
            buttonTitle: "Next"
        },
        {
            "setp" : 2,
            "title" : "Complete tasks",
            "description" : "Stay active in target areas (Active Zones) to boost your earnings.",
            "image" : <Task width={139} height={139} color={colors.icons}/>,
            "imageDescription" : "Tasks fit your normal routine — no extra effort required. Just drive in the required Yerevan zones during specific times.",
            buttonTitle: "Next"
        },
        {
            "setp" : 3,
            "title" : "How you earn",
            "description" : "You get a stable fixed income plus extra rewards for your activity.",
            "image" : <Earn width={139} height={139} color={colors.icons}/>,
            "imageDescription" : "2-door wrap: up to 50,000 AMD / month · 4-door: up to 79,000 AMD / month Example: 10,000 AMD (Fix) + 40,000 AMD (8 bonuses) = 50,000 AMD.",
            buttonTitle: "Next"
        },
        {
            "setp" : 4,
            "title" : "Weekly Payments",
            "description" : "No manual requests needed. All earnings are tracked in real-time.",
            "image" : <Payment width={139} height={139} color={colors.icons}/>,
            "imageDescription" : "Payments are processed automatically and sent to your wallet every week.",
            buttonTitle: "Next"
        },
        {
            "setp" : 5,
            "title" : "Track Your Progress",
            "description" : "Score Breakdown to stay eligible for the  campaigns.",
            "image" : <Progress width={139} height={139} color={colors.icons}/>,
            "imageDescription" : "Top-rated drivers get exclusive early access to the contracts before anyone else",
            buttonTitle: "Start"
        },
    ];
    
    const [showSheet, setShowSheet] = React.useState(true);

    const handelClick = async () => {
        if(state < stepContent.length - 1){
            setState(state + 1)
        }else{
            await AsyncStorage.setItem('howItWorksCompleted', 'true');
            setShowSheet(false)
        }
    }
    return (
        <View style={styles.screen}>
            <BottomSheet
                visible={showSheet}
                onClose={() => setShowSheet(false)}
            >
                <View style={{ padding: 20 , flex: 1, alignItems: 'center'}}>
                    <ScrollView
                        style={{width: '100%'}}
                        contentContainerStyle={{flexGrow: 1, justifyContent: 'space-between', alignItems: 'center'}}
                        showsVerticalScrollIndicator={false}
                    >
                        <View>
                            <Text style={styles.title}>{stepContent[state].title}</Text>
                            <Text style={styles.description}>{stepContent[state].description}</Text>
                        </View>
                        <View style={styles.imageContainer}>
                            {stepContent[state].image}
                            <Text style={styles.imageDescription}>{stepContent[state].imageDescription}</Text>
                        </View>
                    </ScrollView>

                    <Button_ title={stepContent[state].buttonTitle} onPress={handelClick} style={{marginTop: 12}}/>
                </View>
            </BottomSheet>
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 20,
        fontFamily: 'LufgaMedium',
        color: colors.textPrimary,
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 12,
        fontFamily: 'LufgaRegular',
        color: colors.accent,
        textAlign: 'center',
    },

    imageDescription: {
        fontSize: 12,
        fontFamily: 'LufgaRegular',
        color: colors.textSecondary,
        marginTop: 10,
        textAlign: 'center',
    },
    imageContainer:{
        marginHorizontal: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
})