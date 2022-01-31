import { Box, Text, TextField, Image, Button } from '@skynexui/components';

import React from 'react';
import appConfig from '../config.json';

import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/router'

import { ButtonSendSticker } from '../src/components/ButtonSendSticker'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPaperPlane, faRocket } from '@fortawesome/free-solid-svg-icons';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzQ5MzM4MywiZXhwIjoxOTU5MDY5MzgzfQ.5vxekwOf2Uhft1qjVQRThbcLLJAnIV1G1_i12P_m7QA'
const SUPABASE_URL = 'https://ezptpsxxcksineiwjlhr.supabase.co'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function realtimeInsert(setNewMessages) {
    return supabase
        .from('messages')
        .on('INSERT', (newInsertMessage) => {
            setNewMessages(newInsertMessage.new);
        })
        .subscribe();
}

function realtimeDelete(setNewMessages) {
    return supabase
        .from('messages')
        .on('DELETE', (oldDeleteMessage) => {
            setNewMessages(oldDeleteMessage.old);
        })
        .subscribe();
}


export default function ChatPage() {
    const router = useRouter()
    const [message, setMessage] = React.useState('');
    const [messages, setMessages] = React.useState([]);

    React.useEffect(() => {
        supabase.from('messages').select('*').order('id', { ascending: false }).then(({ data }) => {
            setMessages(data);
            console.log('oi')
        })

        const insertSubscription = realtimeInsert((newMesage) => {
            setMessages((currentMessages) => {
                return [
                    newMesage,
                    ...currentMessages,
                ]
            });
        });

        /*const deleteSubscription = realtimeDelete((oldMessage) => {
            setMessages((currentMessages) => {
                return [
                    currentMessages.filter((msg) => msg.id !== oldMessage.id)
                ]
            });
        });*/

        return () => {
            insertSubscription.unsubscribe();
        }

    }, [])


    function handleNewMessage(newMessage) {
        const message = {
            text: newMessage,
            user: router.query.username,
        }
        supabase.from('messages').insert([message]).then()
        setMessage('');
    }


    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundImage: `url(https://wallpaperaccess.com/full/39608.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000'],
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundImage: `url(https://wallpaperaccess.com/full/39608.jpg)`,
                        backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                        backgroundColor: 'rgb(41, 51, 61)',
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >

                    <MessageList messages={messages} setMessages={setMessages} />

                    <Box
                        as="form"
                        styleSheet={{
                            position: 'relative'
                        }}
                    >
                        <Box
                            styleSheet={{
                                position: 'absolute',
                                top: '-2.6rem',
                                right: '2.6rem',

                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}
                        >
                            <ButtonSendSticker
                                onStickerClick={(sticker) => {
                                    handleNewMessage(`:sticker: ${sticker}`)
                                }}
                                style={{
                                    backgroundColor: '#59bfff',

                                    width: '30px',
                                    height: '30px'
                                }}
                            />
                            <FontAwesomeIcon icon={faPaperPlane}
                                onClick={(event) => {
                                    event.preventDefault();
                                    if (message != '') {
                                        handleNewMessage(message);
                                    }
                                }
                                }

                                style={{
                                    cursor: 'pointer',
                                    color: '#59bfff',

                                    width: '30px',
                                    height: '30px'
                                }}

                            />
                        </Box>
                        <TextField
                            value={message}
                            onChange={(event) => {
                                setMessage(event.target.value);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleNewMessage(message);
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box >
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    const router = useRouter()

    function removeMessage(id) {
        const messagesFilter = props.messages.filter((message) => { message.id !== id })
        props.setMessages(messagesFilter)
    }

    return (
        <Box
            tag="ul"
            styleSheet={{
                overflowY: 'scroll',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.messages.map((message) => {
                return (
                    <Text
                        id="li"
                        key={message.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',

                            hover: {
                                backgroundColor: 'rgb(41, 51, 61, 0.375)',
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Image
                                onClick={(event) => {
                                    event.preventDefault()
                                    router.push(`https://github.com/${message.user}`)
                                }}
                                styleSheet={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                    hover: {
                                        transform: 'scale(1.25)',
                                    }
                                }}
                                src={`https://github.com/${message.user}.png`}
                            />
                            <Text tag="strong">
                                {message.user}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    margin: '0px 8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                            <FontAwesomeIcon className="fas fa-times" icon={faTimes} onClick={async (event) => {
                                event.preventDefault();
                                try {
                                    await supabase.from('messages').delete().eq('id', message.id)
                                    props.setMessages(props.messages.filter((msg) => msg.id !== message.id))
                                } catch (error) {
                                    console.log(error)
                                }
                            }}
                                style={{
                                    cursor: 'pointer',
                                    color: '#F08080'
                                }}
                            />
                        </Box>
                        {message.text.startsWith(':sticker:') ?
                            (<Image src={message.text.replace(':sticker:', '')} />)
                            : message.text}
                    </Text>
                )
            })}
        </Box >
    )
}