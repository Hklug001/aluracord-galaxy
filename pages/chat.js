import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLevelUp, faTrashCan } from "@fortawesome/free-solid-svg-icons";

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzQ5MzM4MywiZXhwIjoxOTU5MDY5MzgzfQ.5vxekwOf2Uhft1qjVQRThbcLLJAnIV1G1_i12P_m7QA'
const SUPABASE_URL = 'https://ezptpsxxcksineiwjlhr.supabase.co'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function deleteMessage(messages, message) {
    return messages.filter((element) => { element == message })
}

export default function ChatPage() {
    const [message, setMessage] = React.useState('');
    const [messages, setMessages] = React.useState([]);


    React.useState(() => {
        supabase.from('messages').select('*').order('id', { ascending: false }).then(({ data }) => {
            setMessages(data);
        })
    }, [messages])

    function handleNewMessage(newMessage) {
        const message = {
            text: newMessage,
            user: localStorage.getItem('username'),
        }
        supabase.from('messages').insert([message]).then(({ data }) => {
            setMessages([data[0], ...messages]);
        })

        setMessage('');
    }


    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundImage: `url(https://wallpaperaccess.com/full/39608.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
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
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >

                    <MessageList messages={messages} setArray={setMessages} />

                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
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
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <Button
                            onClick={(event) => {
                                event.preventDefault();
                                if (message != '') {
                                    handleNewMessage(message);
                                }
                            }
                            }
                            label='send'

                            buttonColors={{
                                contrastColor: appConfig.theme.colors.neutrals["000"],
                                mainColor: appConfig.theme.colors.other['light-blue'],
                                mainColorLight: appConfig.theme.colors.primary[400],
                                mainColorStrong: appConfig.theme.colors.neutrals['500'],
                            }}

                        />
                    </Box>
                </Box>
            </Box>
        </Box>
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
        props.setArray(props.messages, filter((message) => { message.id !== id }))
    }

    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
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
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            <Image
                                onClick={(event) => {
                                    event.preventDefault()
                                    router.push(`https://github.com/${message.user}`)
                                }}
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',

                                }}
                                src={`https://github.com/${message.user}.png`}
                            />
                            <Text tag="strong">
                                {message.user}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                        </Box>
                        {message.text}

                        <FontAwesomeIcon className='iconTrash' icon={faTrashCan} onClick={(event) => {
                            event.preventDefault();
                            removeMessage(message.id)
                        }} />
                    </Text>
                )
            })}
        </Box >
    )
}